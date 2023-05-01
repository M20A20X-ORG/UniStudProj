import { RequestHandler } from 'express';
import { TTestCreation, TTestsJson } from '@type/schemas/tests/test';

import { DataDeletionError } from '@exceptions/DataDeletionError';
import { DataAddingError } from '@exceptions/DataAddingError';

import { sendResponse } from '@utils/sendResponse';
import { testsService } from '@services/test';

interface TestsController {
    postCreateTests: RequestHandler;
    deleteTests: RequestHandler;
    getGetTests?: RequestHandler;
    putEditTests?: RequestHandler;
}

class TestsControllerImpl implements TestsController {
    public postCreateTests: RequestHandler = async (req, res) => {
        try {
            const { tests } = req.body as TTestsJson<TTestCreation[]>;
            const serviceResponse = await testsService.createTests(tests);
            return res.status(201).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            let responseStatus = 500;
            if (error instanceof DataAddingError) responseStatus = 409;
            return sendResponse(res, responseStatus, message, stack);
        }
    };

    public deleteTests: RequestHandler = async (req, res) => {
        try {
            const testIdsParam = req.query.testIds as string[];
            const testIds = testIdsParam.map((idStr) => parseInt(idStr));

            const serviceResponse = await testsService.deleteTests(testIds);
            return res.status(200).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            let responseStatus = 500;
            if (error instanceof DataDeletionError) responseStatus = 409;
            return sendResponse(res, responseStatus, message, stack);
        }
    };
}

export const testsController = new TestsControllerImpl();
