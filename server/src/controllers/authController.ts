import { RequestHandler } from 'express';
import { TResponse } from '@type/schemas/response';
import { TUserJson } from '@type/schemas/user';
import { TUserLogin } from '@type/schemas/auth';

import { NoDataError } from '@exceptions/NoDataError';
import { RefreshTokenError } from '@exceptions/RefreshTokenError';

import { log } from '@configs/loggerConfig';

import { authService } from '@services/authService';

interface AuthController {
    getRefreshJwtToken: RequestHandler;
    postLoginUser?: RequestHandler;
}

class AuthControllerImpl implements AuthController {
    public getRefreshJwtToken: RequestHandler = async (req, res) => {
        try {
            const { 'refresh-token': refreshToken } = req.headers;
            if (!refreshToken) {
                const response: TResponse = { message: 'No refresh token provided!' };
                return res.status(401).json(response);
            }

            const serviceResponse = await authService.refreshJwtToken(refreshToken, req.ip);
            return res.status(200).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            if (error instanceof NoDataError) {
                log.warn(message);
                return res.status(404).json({ message } as TResponse);
            }
            if (error instanceof RefreshTokenError) {
                log.warn(message);
                return res.status(401).json({ message } as TResponse);
            }
            log.err(stack ?? message);
            return res.status(500);
        }
    };

    public postLoginUser: RequestHandler = async (req, res) => {
        try {
            const { user: loginCredentials } = req.body as TUserJson<TUserLogin>;
            const serviceResponse = await authService.loginUser(loginCredentials, req.ip);
            return res.status(200).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            if (error instanceof NoDataError) {
                log.warn(message);
                return res.status(404).json({ message } as TResponse);
            }
            log.err(stack ?? message);
            return res.status(500);
        }
    };
}

export const authController = new AuthControllerImpl();