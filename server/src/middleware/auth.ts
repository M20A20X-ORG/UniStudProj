import { RequestHandler } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { TAuthPayload } from '@type/schemas/auth';

import { AuthenticationError } from '@exceptions/AuthenticationError';
import { AuthorizationError } from '@exceptions/AuthorizationError';

import { auth } from '@configs/auth';
import { sendResponse } from '@utils/sendResponse';

export const requireAuth = (
    requiredRoles: string[],
    requiredProjectRoles?: string[]
): RequestHandler => {
    return async (req, res, next) => {
        try {
            const { authorization } = req.headers || {};
            if (typeof authorization !== 'string')
                throw new AuthenticationError("Header 'authorization' is invalid or not exists!");

            const accessTokenPayload: TAuthPayload = await auth.validateJwtToken(authorization);
            auth.authorizeAccess(accessTokenPayload, requiredRoles);
            req.user = accessTokenPayload;

            if (requiredProjectRoles?.length) {
                const { 'project-id': projectIdHeader } = req.headers || {};
                const projectId = parseInt(projectIdHeader || '');
                if (isNaN(projectId))
                    throw new AuthenticationError("Header 'project-id' is invalid or not exists!");

                await auth.authorizeProjectAccess(
                    projectId,
                    accessTokenPayload.userId,
                    requiredProjectRoles
                );
            }

            return next();
        } catch (error: unknown) {
            let responseStatus = 500;
            if (error instanceof AuthorizationError) responseStatus = 403;
            else if (
                error instanceof TokenExpiredError
                || error instanceof JsonWebTokenError
                || error instanceof AuthenticationError
            )
                responseStatus = 401;

            const { stack, message } = error as Error;
            return sendResponse(res, responseStatus, message, stack);
        }
    };
};
