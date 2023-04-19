import { RequestHandler } from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import { TResponse } from '@type/schemas/response';

export const requireQueryValidator = (
    validationChain: ValidationChain
): [ValidationChain, RequestHandler] => {
    const errorHandler: RequestHandler = (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const message = errors.array()[0].msg;
            return res.status(400).json({ message } as TResponse);
        }
        next();
    };
    return [validationChain, errorHandler];
};
