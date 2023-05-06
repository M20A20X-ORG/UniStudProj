import { QueryError } from 'mysql2';
import { PoolConnection } from 'mysql2/promise';
import { TModifyQueryResponse, TReadQueryResponse } from '@type/sql';
import { TPayloadResponse, TResponse } from '@type/schemas/response';
import {
    TTest,
    TTestCompleted,
    TTestCreation,
    TTestEdit,
    TTestId,
    TUserNeedTest,
    TUsersNeedTests
} from '@type/schemas/tests/test';
import {
    TQuestion,
    TQuestionId,
    TQuestionMarked,
    TQuestionPublic
} from '@type/schemas/tests/question';
import { TProjectId } from '@type/schemas/projects/project';

import { DataAddingError } from '@exceptions/DataAddingError';
import { NoDataError } from '@exceptions/NoDataError';
import { DataModificationError } from '@exceptions/DataModificationError';
import { DataDeletionError } from '@exceptions/DataDeletionError';

import { TEST_DATE_DIFF_DEFAULT } from '@static/common';
import { COMMON_SQL } from '@static/sql/common';
import { TEST_SQL } from '@static/sql/test';

import { updateDependent } from '@utils/updateDependent';

import { sqlPool } from '@configs/sqlPool';
import { log } from '@configs/logger';

import { questionsService } from '@services/question';

type TTestCommon = Omit<TTest, 'questions'>;
type TStartTestPayload = { timeLeft: number } | TTest<TQuestionPublic>;

const { createSql, deleteSql, readSql, updateSql, interactSql } = TEST_SQL;
const { getSelectLastInsertId } = COMMON_SQL;

interface TestsService {
    ///// CRUD /////
    createTests: (testData: TTestCreation[]) => Promise<TResponse>;
    getTests: (
        testIds: number[],
        needCommonDataOnly: boolean,
        needResults: boolean
    ) => Promise<TPayloadResponse<Array<TTestCommon | TTest>>>;
    editTests: (testsData: TTestEdit[]) => Promise<TPayloadResponse<Array<TTestCommon | TTest>>>;
    deleteTests: (testIds: number[]) => Promise<TResponse>;
    ///// Interaction /////
    addTestsForUsers: (usersNeedTests: TUserNeedTest[]) => Promise<TResponse>;
    deleteTestsForUsers: (usersNeedTests: TUserNeedTest[]) => Promise<TResponse>;
    startTest: (
        userNeedTest: TUserNeedTest
    ) => Promise<TResponse | TPayloadResponse<TStartTestPayload>>;
    completeTest: (
        testCompleted: TTestCompleted
    ) => Promise<TResponse | TPayloadResponse<TUsersNeedTests>>;
    getResults: (userNeedTest: TUserNeedTest[]) => Promise<TPayloadResponse<TUsersNeedTests[]>>;
}

class TestsServiceImpl implements TestsService {
    ///// Private /////
    ///// CRUD /////
    private _insertTest = async (
        connection: PoolConnection,
        testData: TTestCreation
    ): Promise<void> => {
        const { getInsertTestCommon, getInsertQuestionsOfTests } = createSql;
        const { questionIds, ...questionCommonData } = testData;

        const questionsAmount = questionIds ? questionIds.length : 0;
        if (questionsAmount < 1) throw new DataAddingError('Test must have at least 1 question!');

        try {
            const { dateStart, dateEnd } = questionCommonData;
            const isDateEndInvalid
                = new Date(dateStart).getTime()
                > new Date(dateEnd).getTime() - TEST_DATE_DIFF_DEFAULT;
            if (isDateEndInvalid) {
                const minutes = ((0.0001 * TEST_DATE_DIFF_DEFAULT) / 6).toFixed(0);
                throw new DataAddingError(
                    `dateEnd must be greater than dateStart at least on ${minutes} minutes!`
                );
            }

            const insertTestCommonSql = getInsertTestCommon({
                ...questionCommonData,
                questionsAmount
            });
            const dbTestResponse: TModifyQueryResponse = await connection.query(
                insertTestCommonSql
            );
            log.debug(dbTestResponse);
        } catch (error: unknown) {
            const { code, message } = error as QueryError;
            if (code === 'ER_DUP_ENTRY')
                throw new DataAddingError(`Test '${testData.name}' already exists!`);
            if (code === 'ER_TRUNCATED_WRONG_VALUE')
                throw new DataAddingError(message.split(' for column')[0]);
            throw error;
        }

        const dbNewTestIdResponse: TReadQueryResponse = await connection.query(
            getSelectLastInsertId('testId')
        );
        const [[dbNewTestId]] = dbNewTestIdResponse;
        if (!dbNewTestId) throw new DataAddingError('Error adding new test!');
        const { testId } = dbNewTestId as TTestId;

        if (questionIds?.length) {
            try {
                const insertQuestionsSql = getInsertQuestionsOfTests(testId, questionIds);
                const dbNewTestIdResponse: TModifyQueryResponse = await connection.query(
                    insertQuestionsSql
                );
                log.debug(dbNewTestIdResponse);
            } catch (error: unknown) {
                const { code } = error as QueryError;
                if (code === 'ER_NO_REFERENCED_ROW_2')
                    throw new DataAddingError(
                        "One or several of specified questions from 'questionIds' are not exists!"
                    );
                throw error;
            }
        }
    };

    private _updateTest = async (
        connection: PoolConnection,
        testData: TTestEdit
    ): Promise<void> => {
        const { getUpdateTestCommon, getUpdateQuestions } = updateSql;
        const { questionIds, deleteQuestionIds, ...tCommonData } = testData;

        try {
            const updateTestCommonSql = getUpdateTestCommon(tCommonData);
            if (updateTestCommonSql) {
                const dbTestResponse: TModifyQueryResponse = await connection.query(
                    updateTestCommonSql
                );
                log.debug(dbTestResponse);
            }
        } catch (error: unknown) {
            const { code, message } = error as QueryError;
            if (code === 'ER_DUP_ENTRY')
                throw new DataModificationError('Specified name of test already used!');
            if (code === 'ER_TRUNCATED_WRONG_VALUE')
                throw new DataModificationError(message.split(' for column')[0]);
            throw error;
        }
        await updateDependent<number>(
            connection,
            getUpdateQuestions,
            tCommonData.testId,
            questionIds,
            deleteQuestionIds,
            'question'
        );
    };
    ///// Interaction /////
    private _countScore = async (questionsMarked: TQuestionMarked[]): Promise<number> => {
        const questionMarkedIds: number[] = questionsMarked.map((q) => q.questionId);
        const { payload: questionsResults } = await questionsService.getQuestions(
            questionMarkedIds,
            true
        );

        return questionsMarked.reduce((score, qm) => {
            const questionWithResult = questionsResults.find(
                (qr) => qr.questionId === qm.questionId
            );

            if (!questionWithResult) return score;

            const { options, result } = questionWithResult;
            const { optionIds } = qm;

            const isAllMarkedLessCorrect
                = optionIds.length === options.length && options.length > result.length;
            if (isAllMarkedLessCorrect) return score;

            const coincidesAmount: number = questionWithResult.result.reduce(
                (amount, { optionId }) => amount + (optionIds.includes(optionId) ? 1 : 0),
                0
            );
            return score + questionWithResult.score * 0.01 * coincidesAmount;
        }, 0);
    };

    ///// Public /////
    ///// CRUD /////
    public createTests = async (testsData: TTestCreation[]): Promise<TResponse> => {
        const { getInsertTestsOfProjects } = createSql;

        const connection = await sqlPool.getConnection();
        try {
            await connection.beginTransaction();
            const promiseInserts: Promise<void>[] = testsData.map(
                (tData) =>
                    new Promise<void>(async (resolve, reject) => {
                        try {
                            await this._insertTest(connection, tData);
                            return resolve();
                        } catch (error: unknown) {
                            return reject(error);
                        }
                    })
            );

            await Promise.all(promiseInserts);

            const dbNewTestIdResponse: TReadQueryResponse = await connection.query(
                getSelectLastInsertId('testId')
            );
            const [[dbNewTestId]] = dbNewTestIdResponse;
            if (!dbNewTestId) throw new DataAddingError('Error adding new test!');
            const { testId } = dbNewTestId as TTestId;

            const testsAmount = testsData.length;
            const testsOfProjects: Array<TProjectId & TTestId> = Array(testsAmount)
                .fill(null)
                .map((_, id) => ({
                    testId: testId - testsAmount + id + 1,
                    projectId: testsData[id].projectId
                }));
            const insertTestsOfProjectsSql = getInsertTestsOfProjects(testsOfProjects);
            const dbTestsResponse: TModifyQueryResponse = await connection.query(
                insertTestsOfProjectsSql
            );
            log.debug(dbTestsResponse);

            await connection.commit();
            return {
                message: `Successfully added new tests, amount: '${promiseInserts.length}'`
            };
        } catch (error: unknown) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    };

    public getTests = async (
        testIds: number[],
        needCommonDataOnly: boolean,
        needResults: boolean
    ): Promise<TPayloadResponse<Array<TTestCommon | TTest>>> => {
        const { getSelectTest, selectQuestionIds } = readSql;

        if (!testIds.length) {
            const selectTestSql = getSelectTest(false);
            const dbTestsResponse: TReadQueryResponse = await sqlPool.query(selectTestSql);
            const [dbTests] = dbTestsResponse;
            const tests = dbTests as TTest[];

            const message = !dbTests.length
                ? 'No tests found'
                : `Successfully got tests, amount: ${dbTests.length}`;

            return {
                message: message,
                payload: tests
            };
        }

        const promiseSelects: Promise<TTestCommon | TTest>[] = testIds.map(
            (id) =>
                new Promise<TTestCommon | TTest>(async (resolve, reject) => {
                    try {
                        const selectTestSql = getSelectTest();
                        const dbTestResponse: TReadQueryResponse = await sqlPool.query(
                            selectTestSql,
                            [id]
                        );
                        const [[dbTest]] = dbTestResponse;
                        if (!dbTest)
                            throw new NoDataError(`Specified test, id: ${id} is not exists!`);
                        const test = dbTest as TTest;

                        if (needCommonDataOnly) {
                            return resolve(test);
                        }

                        const dbQuestionIdsResponse: TReadQueryResponse = await sqlPool.query(
                            selectQuestionIds,
                            [id]
                        );
                        const [dbQuestionIds] = dbQuestionIdsResponse;
                        if (testIds.length) {
                            const questionIds: number[] = (
                                dbQuestionIds as Array<TQuestionId & TTestId>
                            ).map((id) => id.questionId);
                            const { payload: questions } = await questionsService.getQuestions(
                                questionIds,
                                needResults
                            );
                            test.questions = questions;
                        }

                        return resolve(test);
                    } catch (error: unknown) {
                        return reject(error);
                    }
                })
        );

        const tests = await Promise.all(promiseSelects);
        return {
            message: `Successfully got tests, amount: ${promiseSelects.length}`,
            payload: tests
        };
    };

    public editTests = async (
        testsData: TTestEdit[]
    ): Promise<TPayloadResponse<Array<TTestCommon | TTest>>> => {
        const connection = await sqlPool.getConnection();
        try {
            await connection.beginTransaction();
            const promiseUpdates: Promise<void>[] = testsData.map(
                (tData) =>
                    new Promise<void>(async (resolve, reject) => {
                        try {
                            await this._updateTest(connection, tData);
                            return resolve();
                        } catch (error: unknown) {
                            return reject(error);
                        }
                    })
            );

            await Promise.all(promiseUpdates);
            await connection.commit();
            connection.release();

            const testIds: number[] = testsData.map((t) => t.testId);
            const { payload: updatedTests } = await this.getTests(testIds, false, true);
            return {
                message: `Successfully updated tests, amount: '${promiseUpdates.length}'`,
                payload: updatedTests as TTest[]
            };
        } catch (error: unknown) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    };

    public deleteTests = async (testIds: number[]): Promise<TResponse> => {
        const { getDeleteTests } = deleteSql;

        const deleteTestsSql = getDeleteTests(testIds);
        const dbDeletionResponse: TModifyQueryResponse = await sqlPool.query(deleteTestsSql);
        log.debug(dbDeletionResponse);

        const [dbDeletion] = dbDeletionResponse;

        let message = `Successfully deleted tests, amount: ${testIds.length}`;
        if (!dbDeletion.affectedRows)
            message = `One or few specified tests from 'testIds' are not exists`;

        return { message };
    };

    ///// Interaction /////
    public addTestsForUsers = async (usersNeedTests: TUserNeedTest[]): Promise<TResponse> => {
        const { getInsertUsersNeedTests } = interactSql;

        try {
            const insertUsersNeedTestsSql = getInsertUsersNeedTests(usersNeedTests);
            const dbUsersResponse: TModifyQueryResponse = await sqlPool.query(
                insertUsersNeedTestsSql
            );
            log.debug(dbUsersResponse);
            return {
                message: `Successfully add tests for specified users, amount: '${usersNeedTests.length}'`
            };
        } catch (error: unknown) {
            const { code } = error as QueryError;
            if (code === 'ER_NO_REFERENCED_ROW_2')
                throw new DataAddingError(`Specified user, project or test are not exists!`);
            if (code === 'ER_DUP_ENTRY')
                throw new DataAddingError(`Specified test already added to user of this project!`);
            throw error;
        }
    };

    public deleteTestsForUsers = async (usersNeedTests: TUserNeedTest[]): Promise<TResponse> => {
        const { getDeleteUsersNeedTests } = interactSql;

        const connection = await sqlPool.getConnection();
        try {
            await connection.beginTransaction();
            const promiseDeletes: Promise<void>[] = usersNeedTests.map(
                (u) =>
                    new Promise<void>(async (resolve, reject) => {
                        try {
                            const deleteUsersNeedTestsSql = getDeleteUsersNeedTests(u);
                            const dbQueryResponse: TModifyQueryResponse = await connection.query(
                                deleteUsersNeedTestsSql
                            );
                            log.debug(dbQueryResponse);
                            return resolve();
                        } catch (error: unknown) {
                            return reject(error);
                        }
                    })
            );
            await Promise.all(promiseDeletes);
            await connection.commit();
            return {
                message: `Successfully delete tests for specified users, amount: '${promiseDeletes.length}'`
            };
        } catch (error: unknown) {
            await connection.rollback();
            const { code } = error as QueryError;
            if (code === 'ER_NO_REFERENCED_ROW_2')
                throw new DataDeletionError(`Specified user, project or test are not exists!`);
            if (code === 'ER_DUP_ENTRY')
                throw new DataDeletionError(
                    `Specified test already added to user of this project!`
                );
            throw error;
        } finally {
            connection.release();
        }
    };

    public startTest = async (
        userNeedTest: TUserNeedTest
    ): Promise<TResponse | TPayloadResponse<TStartTestPayload>> => {
        const { getUpdateUsersNeedTests } = interactSql;
        const { testId, userId } = userNeedTest;

        try {
            const {
                payload: [{ state, dateStarted }]
            } = await this.getResults([userNeedTest]);

            if (state === 'TEST_COMPLETED') {
                return {
                    message: `Test, id: ${userId} for user, id: ${userId} is already completed!`
                };
            }

            const {
                payload: [testDataResponse]
            } = await this.getTests([testId], false, false);
            const testData = testDataResponse as TTest<TQuestionPublic>;
            const { timeLimit, dateStart, dateEnd } = testData;

            const dateNow = new Date();
            const dateNowTime = dateNow.getTime();
            if (dateStart || dateEnd) {
                const isTestNotOpened = new Date(dateStart).getTime() > dateNowTime;
                if (isTestNotOpened) return { message: `Test are not opened yet` };

                const isTestClosed = new Date(dateEnd).getTime() < dateNowTime;
                if (isTestClosed) return { message: `Test are closed` };
            }

            const isStarted
                = new Date(dateStarted).getTime() < dateNowTime && state === 'TEST_STARTED';
            if (isStarted) {
                const timeLeft = new Date(dateStarted).getTime() + timeLimit - dateNowTime;
                return {
                    message: `Test, id: ${testId} for user, id: ${userId} already started!`,
                    payload: { timeLeft }
                };
            }

            const insertUsersNeedTestsSql = getUpdateUsersNeedTests({
                ...userNeedTest,
                state: 'TEST_STARTED',
                dateStarted: dateNow.toISOString().slice(0, -5).replace('T', ' ')
            });
            const dbUsersResponse: TModifyQueryResponse = await sqlPool.query(
                insertUsersNeedTestsSql
            );
            log.debug(dbUsersResponse);

            return {
                message: `Successfully started test for specified user`,
                payload: testData
            };
        } catch (error: unknown) {
            const { code } = error as QueryError;
            if (code === 'ER_NO_REFERENCED_ROW_2')
                throw new DataModificationError('Specified user, test or project are not exists!');
            if (code === 'ER_DUP_ENTRY')
                throw new DataModificationError(
                    "Specified user already started this project's test!"
                );
            throw error;
        }
    };

    public completeTest = async (
        testCompleted: TTestCompleted
    ): Promise<TResponse | TPayloadResponse<TUsersNeedTests>> => {
        const { getUpdateUsersNeedTests } = interactSql;
        const { testId, projectId, userId, dateCompleted, answers } = testCompleted;

        const {
            payload: [{ state }]
        } = await this.getResults([{ testId, projectId, userId: userId }]);
        if (state === 'TEST_COMPLETED') {
            return {
                message: `Specified test, id: ${testId} for user, id: ${userId} already completed `
            };
        } else if (state !== 'TEST_STARTED') {
            return {
                message: `Specified test, id: ${testId} for user, id: ${userId} was not started before`
            };
        }

        const score = await this._countScore(answers);

        const updateUsersNeedTestsSql = getUpdateUsersNeedTests({
            dateCompleted,
            testId,
            projectId,
            userId,
            score,
            state: 'TEST_COMPLETED'
        });
        const dbUsersResponse: TModifyQueryResponse = await sqlPool.query(updateUsersNeedTestsSql);
        log.debug(dbUsersResponse);

        const {
            payload: [testResult]
        } = await this.getResults([{ testId, projectId, userId }]);

        return {
            message: 'Successfully completed test',
            payload: testResult
        };
    };

    public getResults = async (
        usersNeedTests: TUserNeedTest[]
    ): Promise<TPayloadResponse<TUsersNeedTests[]>> => {
        const { getSelectUsersNeedTests } = interactSql;

        const promiseSelects: Promise<TUsersNeedTests>[] = usersNeedTests.map(
            (u) =>
                new Promise<TUsersNeedTests>(async (resolve, reject) => {
                    try {
                        const selectUsersNeedTestsSql = getSelectUsersNeedTests(u);
                        const dbUsersNeedTestsResponse: TReadQueryResponse = await sqlPool.query(
                            selectUsersNeedTestsSql
                        );
                        const [[dbUsersNeedTests]] = dbUsersNeedTestsResponse;
                        if (!dbUsersNeedTests)
                            throw new NoDataError(`No required test found for specified user`);

                        const userTestResult = dbUsersNeedTests as TUsersNeedTests;
                        return resolve(userTestResult);
                    } catch (error: unknown) {
                        return reject(error);
                    }
                })
        );

        const testResults = await Promise.all(promiseSelects);
        return {
            message: `Successfully got tests results`,
            payload: testResults
        };
    };
}

export const testsService = new TestsServiceImpl();
