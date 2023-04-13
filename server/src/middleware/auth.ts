import { RequestHandler } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { TResponse } from '@type/schemas/response';

import { AuthorizationError } from '@exceptions/AuthorizationError';

import { log } from '@configs/logger';
import { auth } from '@configs/auth';

export const requireAuth = (...requiredRoles: string[]): RequestHandler => {
    return async (req, res, next) => {
        const { authorization } = req.headers || {};
        if (typeof authorization !== 'string')
            return res.status(401).json({
                message: 'Authorization header is invalid or not exists!'
            } as TResponse);

        try {
            const accessTokenPayload = await auth.validateJwtToken(authorization);
            auth.authorizeAccess(accessTokenPayload, requiredRoles);
        } catch (error: unknown) {
            const { stack, message } = error as Error;
            if (error instanceof TokenExpiredError || error instanceof JsonWebTokenError) {
                log.warn(message);
                return res.status(401).json({ message } as TResponse);
            } else if (error instanceof AuthorizationError) {
                log.warn(message);
                return res.status(403).json({ message } as TResponse);
            }
            log.err(stack ?? message);
            return res.status(500).json({ message } as TResponse);
        }
        return next();
    };
};
