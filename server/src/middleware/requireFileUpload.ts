import { MulterError } from 'multer';
import { TSetupUpload } from '@type/storage';

import { setupUpload } from '@configs/storage';
import { sendResponse } from '@utils/sendResponse';
import { FileUploadError } from '@exceptions/FileUploadError';

const promisifySetupUpload: TSetupUpload = (type, event, extensions, path) => {
    const handler = setupUpload(type, event, extensions, path);
    return async (req, res, next) =>
        new Promise((resolve, reject) =>
            handler(req, res, (err) => (err ? reject(err) : resolve(next())))
        );
};

export const requireFileUpload: TSetupUpload = (type, event, extensions, path) => {
    return async (req, res, next) => {
        try {
            const handler = promisifySetupUpload(type, event, extensions, path);
            return await handler(req, res, next);
        } catch (error: unknown) {
            const { code, message, stack, field } = error as MulterError;
            let errMessage = message;
            if (code === 'LIMIT_UNEXPECTED_FILE') errMessage = `${message}: '${field}'`;
            return sendResponse(res, 400, new FileUploadError(errMessage).message, stack);
        }
    };
};