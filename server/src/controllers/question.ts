import { RequestHandler } from 'express';
import { TQuestionCreation, TQuestionEdit, TQuestionsJson } from '@type/schemas/tests/question';

import { DataDeletionError } from '@exceptions/DataDeletionError';
import { DataAddingError } from '@exceptions/DataAddingError';
import { NoDataError } from '@exceptions/NoDataError';
import { DataModificationError } from '@exceptions/DataModificationError';

import { sendResponse } from '@utils/sendResponse';
import { questionsService } from '@services/question';

interface QuestionsController {
    deleteDeleteQuestions: RequestHandler;
    postCreateQuestions: RequestHandler;
    getGetQuestions: RequestHandler;
    putEditQuestions?: RequestHandler;
}

class QuestionsControllerImpl implements QuestionsController {
    public deleteDeleteQuestions: RequestHandler = async (req, res) => {
        try {
            const questionIdsParam = req.query.questionIds as string[];
            const questionIds = questionIdsParam.map((idStr) => parseInt(idStr));

            const serviceResponse = await questionsService.deleteQuestions(questionIds);
            return res.status(200).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            let responseStatus = 500;
            if (error instanceof DataDeletionError) responseStatus = 409;
            return sendResponse(res, responseStatus, message, stack);
        }
    };

    public postCreateQuestions: RequestHandler = async (req, res) => {
        try {
            const { questions } = req.body as TQuestionsJson<TQuestionCreation[]>;

            const serviceResponse = await questionsService.createQuestions(questions);
            return res.status(201).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            let responseStatus = 500;
            if (error instanceof DataAddingError) responseStatus = 409;
            return sendResponse(res, responseStatus, message, stack);
        }
    };

    public getGetQuestions: RequestHandler = async (req, res) => {
        try {
            const questionIdsParam = req.query.questionIds as string[];
            const questionIds = questionIdsParam.map((idStr) => parseInt(idStr));

            const serviceResponse = await questionsService.getQuestions(questionIds);
            return res.status(201).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            let responseStatus = 500;
            if (error instanceof NoDataError) responseStatus = 404;
            return sendResponse(res, responseStatus, message, stack);
        }
    };

    public putEditQuestions: RequestHandler = async (req, res) => {
        try {
            const { questions } = req.body as TQuestionsJson<TQuestionEdit[]>;

            const serviceResponse = await questionsService.editQuestions(questions);
            return res.status(201).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            let responseStatus = 500;
            if (error instanceof NoDataError) responseStatus = 404;
            if (error instanceof DataModificationError) responseStatus = 409;
            return sendResponse(res, responseStatus, message, stack);
        }
    };
}

export const questionsController = new QuestionsControllerImpl();
