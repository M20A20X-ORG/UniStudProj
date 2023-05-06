import { RequestHandler } from 'express';
import {
    TTestCompleted,
    TTestCreation,
    TTestEdit,
    TTestsJson,
    TUserNeedTest
} from '@type/schemas/tests/test';

import { DataDeletionError } from '@exceptions/DataDeletionError';
import { DataAddingError } from '@exceptions/DataAddingError';
import { NoDataError } from '@exceptions/NoDataError';
import { DataModificationError } from '@exceptions/DataModificationError';

import { sendResponse } from '@utils/sendResponse';

import { testsService } from '@services/test';

interface TestsController {
    ///// CRUD /////
    postCreateTests: RequestHandler;
    getGetTests: RequestHandler;
    putEditTests: RequestHandler;
    deleteTests: RequestHandler;
    ///// Interaction /////
    postAddTestsForUsers: RequestHandler;
    putStartTest: RequestHandler;
    putCompleteTest: RequestHandler;
    getTestsResults: RequestHandler;
    postDeleteTestsForUsers: RequestHandler;
}

class TestsControllerImpl implements TestsController {
    ///// CRUD /////
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
            const needCommonDataOnly = (req.query.needCommonDataOnly as string) === 'true';
            const needResults = (req.query.needResults as string) === 'true';
            const testIdsParam = (req.query.testIds as string[]) ?? [];
            const testIds = testIdsParam.map((idStr) => parseInt(idStr));

            const serviceResponse = await testsService.getTests(
                testIds,
                needCommonDataOnly,
                needResults
            );
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

    ///// Interaction /////
    public postAddTestsForUsers: RequestHandler = async (req, res) => {
        try {
            const { tests } = req.body as TTestsJson<TUserNeedTest[]>;
            const serviceResponse = await testsService.addTestsForUsers(tests);
            return res.status(201).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            let responseStatus = 500;
            if (error instanceof DataAddingError) responseStatus = 409;
            return sendResponse(res, responseStatus, message, stack);
        }
    };

    public putStartTest: RequestHandler = async (req, res) => {
        try {
            const { tests } = req.body as TTestsJson<TUserNeedTest>;
            const serviceResponse = await testsService.startTest(tests);
            return res.status(200).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            let responseStatus = 500;
            if (error instanceof DataModificationError || error instanceof NoDataError)
                responseStatus = 409;
            return sendResponse(res, responseStatus, message, stack);
        }
    };

    public putCompleteTest: RequestHandler = async (req, res) => {
        try {
            const { tests } = req.body as TTestsJson<TTestCompleted>;
            const serviceResponse = await testsService.completeTest(tests);
            return res.status(200).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            let responseStatus = 500;
            if (error instanceof DataAddingError || error instanceof NoDataError)
                responseStatus = 409;
            return sendResponse(res, responseStatus, message, stack);
        }
    };

    public getTestsResults: RequestHandler = async (req, res) => {
        try {
            const { tests } = req.body as TTestsJson<TUserNeedTest[]>;
            const serviceResponse = await testsService.getResults(tests);
            return res.status(200).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            let responseStatus = 500;
            if (error instanceof NoDataError) responseStatus = 404;
            return sendResponse(res, responseStatus, message, stack);
        }
    };

    public postDeleteTestsForUsers: RequestHandler = async (req, res) => {
        try {
            const { tests } = req.body as TTestsJson<TUserNeedTest[]>;
            const serviceResponse = await testsService.deleteTestsForUsers(tests);
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
