import { RequestHandler } from 'express';
import { TQuestionCreation, TQuestionsJson } from '@type/schemas/tests/question';

import { DataDeletionError } from '@exceptions/DataDeletionError';
import { DataAddingError } from '@exceptions/DataAddingError';

import { sendResponse } from '@utils/sendResponse';
import { questionsService } from '@services/question';

interface QuestionsController {
    postCreateQuestion: RequestHandler;
    deleteDeleteQuestion: RequestHandler;
    getGetQuestion?: RequestHandler;
    putEditQuestion?: RequestHandler;
}

class QuestionsControllerImpl implements QuestionsController {
    public deleteDeleteQuestion: RequestHandler = async (req, res) => {
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

    public postCreateQuestion: RequestHandler = async (req, res) => {
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
}

export const questionsController = new QuestionsControllerImpl();
