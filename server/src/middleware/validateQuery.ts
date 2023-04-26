import { RequestHandler } from 'express';
import { ValidationChain, validationResult } from 'express-validator';

import { TResponse } from '@type/schemas/response';
import { RequestParamsError } from '@exceptions/RequestParamsError';

const errorHandler: RequestHandler = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const [{ msg }] = errors.array();
        const { message } = new RequestParamsError(msg);
        return res.status(400).json({ message } as TResponse);
    }
    next();
};

export const requireQueryValidator = (
    ...validations: ValidationChain[]
): [ValidationChain[], RequestHandler] => [validations, errorHandler];
