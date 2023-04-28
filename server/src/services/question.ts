import { QueryError } from 'mysql2';
import { PoolConnection } from 'mysql2/promise';
import { TPayloadResponse, TResponse } from '@type/schemas/response';
import {
    TQuestion,
    TQuestionCreation,
    TQuestionEdit,
    TQuestionId
} from '@type/schemas/tests/question';

import { DataAddingError } from '@exceptions/DataAddingError';

import { QUESTION_SQL } from '@static/sql/quesiton';
import { sqlPool } from '@configs/sqlPool';
import { COMMON_SQL } from '@static/sql/common';

const { deleteSql, createSql } = QUESTION_SQL;
const { getSelectLastInsertId } = COMMON_SQL;

interface QuestionsService {
    deleteQuestions: (questionIds: number[]) => Promise<TResponse>;
    createQuestions: (questionsData: TQuestionCreation[]) => Promise<TResponse>;
    getQuestions?: (questionsIds?: number[]) => Promise<TPayloadResponse<TQuestion[]>>;
    editQuestions?: (questionsData: TQuestionEdit[]) => Promise<TPayloadResponse<TQuestion>>;
}

class QuestionsServiceImpl implements QuestionsService {
    ///// Private /////
    private _insertQuestion = async (
        connection: PoolConnection,
        questionData: TQuestionCreation
    ) => {
        const { getInsertQuestionsCommon, getInsertQuestionOptions } = createSql;

        const { options, ...qCommonData } = questionData;
        if (options.length < 2) throw new DataAddingError('Question must have at least 2 options!');

        try {
            const insertQuestionsCommonSql = getInsertQuestionsCommon(qCommonData);
            await connection.query(insertQuestionsCommonSql);
        } catch (error: unknown) {
            const { code } = error as QueryError;
            if (code === 'ER_NO_REFERENCED_ROW_2')
                throw new DataAddingError(
                    'Specified type of question or program language are not exists!'
                );
            throw error;
        }

        const getSelectQuestionLIId = getSelectLastInsertId('questionId');
        const dbNewQuestionIdResponse = await connection.query(getSelectQuestionLIId);
        const [[dbNewQuestionId]] = dbNewQuestionIdResponse as any;
        if (!dbNewQuestionId) throw new DataAddingError('Error adding new question!');
        const { questionId } = dbNewQuestionId as TQuestionId;

        const insertOptionsSql = getInsertQuestionOptions(questionId, options);
        await connection.query(insertOptionsSql);
    };

    ///// Public /////
    public deleteQuestions = async (questionIds: number[]): Promise<TResponse> => {
        const { getDeleteQuestions } = deleteSql;

        const deleteQuestionsSql = getDeleteQuestions(questionIds);
        const dbDeletionResponse = await sqlPool.query(deleteQuestionsSql);
        const [dbDeletion] = dbDeletionResponse as any[];

        let message = `Successfully deleted questions, amount: ${questionIds.length}`;
        if (!dbDeletion.affectedRows) message = `No questions found, ids: ${questionIds}`;

        return { message };
    };

    public createQuestions = async (questionsData: TQuestionCreation[]): Promise<TResponse> => {
        const connection = await sqlPool.getConnection();
        try {
            await connection.beginTransaction();
            const promiseInserts: Promise<void>[] = questionsData.map(
                (qData) =>
                    new Promise<void>(async (resolve, reject) => {
                        try {
                            await this._insertQuestion(connection, qData);
                            return resolve();
                        } catch (error: unknown) {
                            return reject(error);
                        }
                    })
            );

            await Promise.all(promiseInserts);
            await connection.commit();
            return {
                message: `Successfully added new questions, amount: '${promiseInserts.length}'`
            };
        } catch (error: unknown) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    };
}

export const questionsService = new QuestionsServiceImpl();
