import { RequestHandler } from 'express';
import { TPayloadResponse } from '@type/schemas/response';

import { DataAddingError } from '@exceptions/DataAddingError';

import { sendResponse } from '@utils/sendResponse';

interface ResourceController {
    postCreateResource: RequestHandler;
}

class ResourceControllerImpl implements ResourceController {
    public postCreateResource: RequestHandler = async (req, res) => {
        try {
            const { files } = req;
            if (!Array.isArray(files) || !files.length)
                throw new DataAddingError('File is not provided!');

            const apiUrl = req.protocol + '://' + req.get('host') + '/';
            const payload: string[] = files.map((file) => apiUrl + file.filename);

            const response: TPayloadResponse<any> = {
                message: `Successfully created resources, amount: ${files.length}`,
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
