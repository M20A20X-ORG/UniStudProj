import { QueryError } from 'mysql2';
import { PoolConnection } from 'mysql2/promise';
import { TModifyQueryResponse, TReadQueryResponse } from '@type/sql';
import { TPayloadResponse, TResponse } from '@type/schemas/response';
import {
    TOption,
    TOptionCreation,
    TOptionEdit,
    TOptionId,
    TQuestion,
    TQuestionCreation,
    TQuestionEdit,
    TQuestionId
} from '@type/schemas/tests/question';

import { DataAddingError } from '@exceptions/DataAddingError';
import { NoDataError } from '@exceptions/NoDataError';
import { DataModificationError } from '@exceptions/DataModificationError';

import { QUESTION_SQL } from '@static/sql/quesiton';
import { COMMON_SQL } from '@static/sql/common';

import { updateDependent } from '@utils/updateDependent';

import { sqlPool } from '@configs/sqlPoolConfig';
import { log } from '@configs/loggerConfig';

const { deleteSql, createSql, readSql, updateSql } = QUESTION_SQL;
const { getSelectLastInsertId } = COMMON_SQL;

interface QuestionsService {
    deleteQuestions: (questionIds: number[]) => Promise<TResponse>;
    createQuestions: (questionsData: TQuestionCreation[]) => Promise<TResponse>;
    getQuestions: (
        questionsIds: number[],
        needResults: boolean
    ) => Promise<TPayloadResponse<TQuestion[]>>;
    editQuestions: (questionsData: TQuestionEdit[]) => Promise<TPayloadResponse<TQuestion[]>>;
}

class QuestionsServiceImpl implements QuestionsService {
    ///// Private /////
    private _insertQuestion = async (
        connection: PoolConnection,
        questionData: TQuestionCreation
    ) => {
        const { getInsertQuestionsCommon, getInsertQuestionOptions, getInsertQuestionResults }
            = createSql;
        const { options, results, ...qCommonData } = questionData;

        results.forEach((r) => {
            const isResultsRespectOptions = options.find(
                (o) => o.text === r.text && o.imageUrl === r.imageUrl
            );
            if (!isResultsRespectOptions)
                throw new DataAddingError(
                    `Result: '${JSON.stringify(r)}' are not respects provided options!`
                );
        });

        try {
            const insertQuestionsCommonSql = getInsertQuestionsCommon(qCommonData);
            const dbQuestionsResponse: TModifyQueryResponse = await connection.query(
                insertQuestionsCommonSql
            );
            log.debug(dbQuestionsResponse);
        } catch (error: unknown) {
            const { code } = error as QueryError;
            if (code === 'ER_NO_REFERENCED_ROW_2')
                throw new DataAddingError(
                    'Specified type of question or program language are not exists!'
                );
            throw error;
        }

        const dbNewQuestionIdResponse: TReadQueryResponse = await connection.query(
            getSelectLastInsertId('questionId')
        );
        const [[dbNewQuestionId]] = dbNewQuestionIdResponse;
        if (!dbNewQuestionId) throw new DataAddingError('Error adding new question!');
        const { questionId } = dbNewQuestionId as TQuestionId;

        const insertOptionsSql = getInsertQuestionOptions(questionId, options);
        const dbOptionsResponse: TModifyQueryResponse = await connection.query(insertOptionsSql);
        log.debug(dbOptionsResponse);

        const dbNewOptionIdResponse: TReadQueryResponse = await connection.query(
            getSelectLastInsertId('optionId')
        );
        const [[dbNewOptionId]] = dbNewOptionIdResponse;
        if (!dbNewOptionId) throw new DataAddingError('Error adding new option!');
        const { optionId: optionLIId } = dbNewOptionId as TOptionId;

        const resultIds: number[] = new Array(results.length)
            .fill(null)
            .map((_, id) => optionLIId - id);
        const insertQuestionResultsSql = getInsertQuestionResults(questionId, resultIds);
        const dbQueryResponse: TModifyQueryResponse = await connection.query(
            insertQuestionResultsSql
        );
        log.debug(dbQueryResponse);
    };

    private _updateQuestion = async (connection: PoolConnection, questionData: TQuestionEdit) => {
        const { getUpdateQuestionCommon, getUpdateOptions, getUpdateResults } = updateSql;
        const { options, resultIds, deleteOptionIds, ...qCommonData } = questionData;

        try {
            const updateQuestionCommonSql = getUpdateQuestionCommon(qCommonData);
            if (updateQuestionCommonSql) {
                const dbQuestionResponse: TModifyQueryResponse = await connection.query(
                    updateQuestionCommonSql
                );
                log.debug(dbQuestionResponse);
            }
        } catch (error: unknown) {
            const { code } = error as QueryError;
            if (code === 'ER_NO_REFERENCED_ROW_2')
                throw new DataModificationError(
                    'Specified type of question or program language are not exists!'
                );
            throw error;
        }

        await updateDependent<TOptionEdit>(
            connection,
            getUpdateOptions,
            qCommonData.questionId,
            options,
            deleteOptionIds,
            'option'
        );

        if (resultIds?.length) {
            await updateDependent<number>(
                connection,
                getUpdateResults,
                qCommonData.questionId,
                resultIds,
                [],
                'option'
            );
        }
    };

    ///// Public /////
    public deleteQuestions = async (questionIds: number[]): Promise<TResponse> => {
        const { getDeleteQuestions } = deleteSql;

        const deleteQuestionsSql = getDeleteQuestions(questionIds);
        log.debug(deleteQuestionsSql);

        const dbDeletionResponse: TModifyQueryResponse = await sqlPool.query(deleteQuestionsSql);
        const [dbDeletion] = dbDeletionResponse;

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
                            const dbQuestionResponse = await this._insertQuestion(
                                connection,
                                qData
                            );
                            log.debug(dbQuestionResponse);
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

    public getQuestions = async (
        questionIds: number[],
        needResults: boolean
    ): Promise<TPayloadResponse<TQuestion[]>> => {
        const { selectQuestion, selectQuestionOptions, selectQuestionResults } = readSql;

        const promiseSelects: Promise<TQuestion>[] = questionIds.map(
            (id) =>
                new Promise<TQuestion>(async (resolve, reject) => {
                    try {
                        const dbQuestionResponse: TReadQueryResponse = await sqlPool.query(
                            selectQuestion,
                            [id]
                        );
                        const [[dbQuestion]] = dbQuestionResponse;
                        if (!dbQuestion)
                            throw new NoDataError(`Specified question, id: ${id} is not exists!`);
                        const question = dbQuestion as TQuestion;

                        const dbOptionsResponse: TReadQueryResponse = await sqlPool.query(
                            selectQuestionOptions,
                            [id]
                        );
                        const [dbOptions] = dbOptionsResponse;
                        if (dbOptions.length) question.options = dbOptions as TOption[];

                        if (needResults) {
                            const dbResultsResponse: TReadQueryResponse = await sqlPool.query(
                                selectQuestionResults,
                                [id]
                            );
                            const [dbResults] = dbResultsResponse;
                            if (dbResults.length) question.result = dbResults as TOption[];
                        }

                        return resolve(question);
                    } catch (error: unknown) {
                        return reject(error);
                    }
                })
        );

        const questions = (await Promise.all(promiseSelects)) as TQuestion[];
        return {
            message: `Successfully got questions, amount: ${promiseSelects.length}`,
            payload: questions
        };
    };

    public editQuestions = async (
        questionsData: TQuestionEdit[]
    ): Promise<TPayloadResponse<TQuestion[]>> => {
        const connection = await sqlPool.getConnection();
        try {
            await connection.beginTransaction();
            const promiseUpdates: Promise<void>[] = questionsData.map(
                (qData) =>
                    new Promise<void>(async (resolve, reject) => {
                        try {
                            const dbQuestionResponse = await this._updateQuestion(
                                connection,
                                qData
                            );
                            log.debug(dbQuestionResponse);
                            return resolve();
                        } catch (error: unknown) {
                            return reject(error);
                        }
                    })
            );

            await Promise.all(promiseUpdates);
            await connection.commit();
            connection.release();

            const questionIds: number[] = questionsData.map((q) => q.questionId);
            const { payload: updatedQuestions } = await this.getQuestions(questionIds, true);
            return {
                message: `Successfully updated questions, amount: '${promiseUpdates.length}'`,
                payload: updatedQuestions
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
