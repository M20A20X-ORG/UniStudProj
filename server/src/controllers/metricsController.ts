import { RequestHandler } from 'express';
import { TMetricsUpdateAction } from '@type/schemas/metrics';

import { NoDataError } from '@exceptions/NoDataError';
import { DataModificationError } from '@exceptions/DataModificationError';

import { sendResponse } from '@utils/sendResponse';

import { metricsService } from '@services/metricsService';

interface MetricsController {
    getGetMetrics: RequestHandler;
    putUpdateMetrics: RequestHandler;
}

class MetricsControllerImpl implements MetricsController {
    public putUpdateMetrics: RequestHandler = async (req, res) => {
        try {
            const updateAction = req.query.updateAction as TMetricsUpdateAction;
            const serviceResponse = await metricsService.updateMetrics(updateAction);
            return res.status(200).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            let responseStatus = 500;
            if (error instanceof DataModificationError) responseStatus = 409;
            return sendResponse(res, responseStatus, message, stack);
        }
    };

    public getGetMetrics: RequestHandler = async (req, res) => {
        try {
            const serviceResponse = await metricsService.getMetrics(false);
            return res.status(200).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            let responseStatus = 500;
            if (error instanceof NoDataError) responseStatus = 404;
            return sendResponse(res, responseStatus, message, stack);
        }
    };
}

export const metricsController = new MetricsControllerImpl();
