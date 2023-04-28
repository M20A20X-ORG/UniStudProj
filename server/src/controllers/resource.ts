import { RequestHandler } from 'express';
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
            const payload = files.map((file) => apiUrl + file.filename);

            return res.status(201).json({
                message: `Successfully created resources, amount: ${files.length}`,
                payload
            });
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            let responseStatus = 500;
            if (error instanceof DataAddingError) responseStatus = 409;
            return sendResponse(res, responseStatus, message, stack);
        }
    };
}

export const resourceController = new ResourceControllerImpl();
