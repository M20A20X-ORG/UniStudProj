import { QueryError } from 'mysql2';
import { PoolConnection } from 'mysql2/promise';

import { TPayloadResponse, TResponse } from '@type/schemas/response';
import { TTest, TTestCreation, TTestEdit, TTestId } from '@type/schemas/tests/test';
import { TQuestionId, TQuestionMarked } from '@type/schemas/tests/question';
import { TProjectId } from '@type/schemas/projects/project';

import { DataAddingError } from '@exceptions/DataAddingError';
import { NoDataError } from '@exceptions/NoDataError';
import { DataModificationError } from '@exceptions/DataModificationError';

import { TEST_SQL } from '@static/sql/test';
import { COMMON_SQL } from '@static/sql/common';
import { TEST_DATE_DIFF_DEFAULT } from '@static/common';

import { sqlPool } from '@configs/sqlPool';
import { updateDependent } from '@utils/updateDependent';
import { questionsService } from '@services/question';

type TTestCommon = Omit<TTest, 'questions'>;

const { createSql, deleteSql, readSql, updateSql } = TEST_SQL;
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
            const isDateEndInvalid =
                new Date(dateStart).getTime() >
                new Date(dateEnd).getTime() - TEST_DATE_DIFF_DEFAULT;
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
            await connection.query(insertTestCommonSql);
        } catch (error: unknown) {
            const { code, message } = error as QueryError;
            if (code === 'ER_DUP_ENTRY')
                throw new DataAddingError(`Test '${testData.name}' already exists!`);
            if (code === 'ER_TRUNCATED_WRONG_VALUE')
                throw new DataAddingError(message.split(' for column')[0]);
            throw error;
        }

        const getSelectTestLIId = getSelectLastInsertId('testId');
        const dbNewTestIdResponse = await connection.query(getSelectTestLIId);
        const [[dbNewTestId]] = dbNewTestIdResponse as any;
        if (!dbNewTestId) throw new DataAddingError('Error adding new test!');
        const { testId } = dbNewTestId as TTestId;

        if (questionIds?.length) {
            try {
                const insertQuestionsSql = getInsertQuestionsOfTests(testId, questionIds);
                await connection.query(insertQuestionsSql);
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
            if (updateTestCommonSql) await connection.query(updateTestCommonSql);
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

            const isAllMarkedLessCorrect =
                optionIds.length === options.length && options.length > result.length;
            if (isAllMarkedLessCorrect) return score;

            const coincidesAmount = questionWithResult.result.reduce(
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

            const getSelectTestLIId = getSelectLastInsertId('testId');
            const dbNewTestIdResponse = await connection.query(getSelectTestLIId);
            const [[dbNewTestId]] = dbNewTestIdResponse as any;
            if (!dbNewTestId) throw new DataAddingError('Error adding new test!');
            const { testId } = dbNewTestId as TTestId;

            const testsAmount = testsData.length;
            const testsOfProjects: Array<TProjectId & TTestId> = Array(testsAmount)
                .fill(null)
                .map((_, id) => ({
                    testId: testId - testsAmount + id + 1,
                    projectId: testsData[id].projectId
                }));
            const insertTestsOfProjects = getInsertTestsOfProjects(testsOfProjects);
            await connection.query(insertTestsOfProjects);

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
            const dbTestsResponse = await sqlPool.query(selectTestSql);
            const [dbTests] = dbTestsResponse as any[];
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
                        const dbTestResponse = await sqlPool.query(selectTestSql, [id]);
                        const [[dbTest]] = dbTestResponse as any;
                        if (!dbTest)
                            throw new NoDataError(`Specified test, id: ${id} is not exists!`);
                        const test = dbTest as TTest;

                        if (needCommonDataOnly) {
                            return resolve(test);
                        }

                        const dbQuestionIdsResponse = await sqlPool.query(selectQuestionIds, [id]);
                        const [dbQuestionIds] = dbQuestionIdsResponse as any[];
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

        const tests = (await Promise.all(promiseSelects)) as Array<TTestCommon | TTest>;
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

            const testIds = testsData.map((t) => t.testId);
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
        const dbDeletionResponse = await sqlPool.query(deleteTestsSql);
        const [dbDeletion] = dbDeletionResponse as any[];

        let message = `Successfully deleted tests, amount: ${testIds.length}`;
        if (!dbDeletion.affectedRows)
            message = `One or few specified tests from 'testIds' are not exists`;

        return { message };
    };
}

export const testsService = new TestsServiceImpl();
