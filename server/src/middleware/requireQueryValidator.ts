import { RequestHandler } from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import { RequestParamsError } from '@exceptions/RequestParamsError';

import { sendResponse } from '@utils/sendResponse';

const errorHandler: RequestHandler = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const [{ msg }] = errors.array();
        const { message } = new RequestParamsError(msg);
        return sendResponse(res, 400, message, undefined);
    }
    next();
};

export const requireQueryValidator = (
    ...validations: ValidationChain[]
): [ValidationChain[], RequestHandler] => [validations, errorHandler];
