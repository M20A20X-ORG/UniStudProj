import { RequestHandler } from 'express';
import { TNewsCreation, TNewsEdit, TNewsJson } from '@type/schemas/news';

import { DataDeletionError } from '@exceptions/DataDeletionError';
import { NoDataError } from '@exceptions/NoDataError';
import { DataAddingError } from '@exceptions/DataAddingError';
import { DataModificationError } from '@exceptions/DataModificationError';

import { sendResponse } from '@utils/sendResponse';

import { newsService } from '@services/newsService';

interface NewsController {
    getGetNews: RequestHandler;
    postCreateNews: RequestHandler;
    putEditNews: RequestHandler;
    deleteNews: RequestHandler;
}

class NewsControllerImpl implements NewsController {
    public postCreateNews: RequestHandler = async (req, res) => {
        try {
            const { news } = req.body as TNewsJson<TNewsCreation[]>;
            const serviceResponse = await newsService.createNews(news);
            return res.status(201).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            let responseStatus = 500;
            if (error instanceof DataAddingError) responseStatus = 409;
            return sendResponse(res, responseStatus, message, stack);
        }
    };

    public getGetNews: RequestHandler = async (req, res) => {
        try {
            const newsIdsParam = req.query.newsIds as string[];
            const needCommonData = (req.query.needCommonData as string) === 'true';

            const limit = parseInt(req.query.limit as string);
            const newsIds = newsIdsParam.map((id) => parseInt(id));

            const serviceResponse = await newsService.getNews(newsIds, needCommonData, limit);
            return res.status(200).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            let responseStatus = 500;
            if (error instanceof NoDataError) responseStatus = 404;
            return sendResponse(res, responseStatus, message, stack);
        }
    };

    public putEditNews: RequestHandler = async (req, res) => {
        try {
            const { news } = req.body as TNewsJson<TNewsEdit[]>;
            const serviceResponse = await newsService.editNews(news);
            return res.status(200).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            let responseStatus = 500;
            if (error instanceof DataModificationError || error instanceof NoDataError)
                responseStatus = 409;
            return sendResponse(res, responseStatus, message, stack);
        }
    };

    public deleteNews: RequestHandler = async (req, res) => {
        try {
            const newsIdsParam = req.query.newsIds as string[];
            const newsIds = newsIdsParam.map((idStr) => parseInt(idStr));

            const serviceResponse = await newsService.deleteNews(newsIds);
            return res.status(200).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            let responseStatus = 500;
            if (error instanceof DataDeletionError) responseStatus = 409;
            return sendResponse(res, responseStatus, message, stack);
        }
    };
}

export const newsController = new NewsControllerImpl();
