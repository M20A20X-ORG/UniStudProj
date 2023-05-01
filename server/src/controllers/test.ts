import { RequestHandler } from 'express';
import { TTestCreation, TTestEdit, TTestsJson } from '@type/schemas/tests/test';

import { DataDeletionError } from '@exceptions/DataDeletionError';
import { DataAddingError } from '@exceptions/DataAddingError';
import { NoDataError } from '@exceptions/NoDataError';

import { sendResponse } from '@utils/sendResponse';
import { testsService } from '@services/test';
import { DataModificationError } from '@exceptions/DataModificationError';

interface TestsController {
    postCreateTests: RequestHandler;
    getGetTests: RequestHandler;
    putEditTests: RequestHandler;
    deleteTests: RequestHandler;
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

    public getGetTests: RequestHandler = async (req, res) => {
        try {
            const testIdsParam = (req.query.testIds as string[]) ?? [];
            const needCommonDataOnlyParam = req.query.needCommonDataOnly as string;

            const testIds = testIdsParam.map((idStr) => parseInt(idStr));
            const needCommonDataOnly = needCommonDataOnlyParam
                ? needCommonDataOnlyParam === 'true'
                : false;

            const serviceResponse = await testsService.getTests(testIds, needCommonDataOnly);
            return res.status(201).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            let responseStatus = 500;
            if (error instanceof NoDataError) responseStatus = 404;
            return sendResponse(res, responseStatus, message, stack);
        }
    };

    public putEditTests: RequestHandler = async (req, res) => {
        try {
            const { tests } = req.body as TTestsJson<TTestEdit[]>;

            const serviceResponse = await testsService.editTests(tests);
            return res.status(201).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            let responseStatus = 500;
            if (error instanceof NoDataError) responseStatus = 404;
            if (error instanceof DataModificationError) responseStatus = 409;
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
