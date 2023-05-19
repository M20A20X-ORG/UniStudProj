import { RequestHandler } from 'express';
import { TResponse } from '@type/schemas/response';

import { DataAddingError } from '@exceptions/DataAddingError';

import { sendResponse } from '@utils/sendResponse';

interface ResourceController {
    postCreateResource: RequestHandler;
}

class ResourceControllerImpl implements ResourceController {
    public postCreateResource: RequestHandler = async (req, res) => {
        try {
            const { file } = req;
            if (!file) throw new DataAddingError('File is not provided!');

            const apiUrl = req.protocol + '://' + req.get('host') + '/';
            const payload: string = apiUrl + file.filename;

            const response: TResponse<string> = {
                message: `Successfully create resource`,
                payload
            };
            return res.status(201).json(response);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            let responseStatus = 500;
            if (error instanceof DataAddingError) responseStatus = 409;
            return sendResponse(res, responseStatus, message, stack);
        }
    };
}

export const resourceController = new ResourceControllerImpl();
