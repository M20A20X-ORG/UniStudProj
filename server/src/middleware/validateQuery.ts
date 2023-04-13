import { RequestHandler } from 'express';
import { responseBadQuery } from '@utils/responseBadQuery';

export const requireValidateQuery = (...params: string[]): RequestHandler => {
    return (req, res, next) => {
        if (!Object.keys(req.query).every((param) => params.includes(param))) {
            return responseBadQuery(
                res,
                params.reduce((result, param) => result.concat(`'${param}'`), '')
            );
        }
        return next();
    };
};
