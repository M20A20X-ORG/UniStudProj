import { QueryError } from 'mysql2';
import { PoolConnection } from 'mysql2/promise';

import { TPayloadResponse, TResponse } from '@type/schemas/response';
import { TTest, TTestCreation, TTestEdit, TTestId } from '@type/schemas/tests/test';

import { DataAddingError } from '@exceptions/DataAddingError';

import { sqlPool } from '@configs/sqlPool';

import { TEST_SQL } from '@static/sql/test';
import { COMMON_SQL } from '@static/sql/common';

const { createSql, deleteSql } = TEST_SQL;
const { getSelectLastInsertId } = COMMON_SQL;

interface TestsService {
    createTests: (testData: TTestCreation[]) => Promise<TResponse>;
    deleteTests: (testIds: number[]) => Promise<TResponse>;
    getTests?: (testIds: number[], commonOnly: boolean) => Promise<TPayloadResponse<TTest[]>>;
    editTests?: (testsData: TTestEdit[]) => Promise<TPayloadResponse<TTest[]>>;
}

class TestsServiceImpl implements TestsService {
    ///// Private /////
    private _insertTest = async (connection: PoolConnection, testData: TTestCreation) => {
        const { getInsertTestCommon, getInsertQuestionsOfTests } = createSql;

        const { questionIds, ...questionCommonData } = testData;

        const questionsAmount = questionIds ? questionIds.length : 0;
        if (questionsAmount < 1) throw new DataAddingError('Test must have at least 1 question!');

        try {
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

    ///// Public /////
    public createTests = async (testsData: TTestCreation[]): Promise<TResponse> => {
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
