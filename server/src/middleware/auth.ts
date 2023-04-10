import { Request, RequestHandler } from 'express';
import { auth } from '@configs/auth';

export const requireValidateAuth = (accessRoles: string[]): RequestHandler => {
    return (req, res, next) => {
        auth.validateToken(req as Request, res);
        auth.authorizeAccess(accessRoles, req as Request, res);
        next();
    };
};
