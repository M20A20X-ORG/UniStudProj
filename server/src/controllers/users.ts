import { RequestHandler } from 'express';
import { TResponse } from '@type/schemas/response';

import { TUserJson, TUserLogin } from '@type/schemas/user';

import { NoDataError } from '@exceptions/NoDataError';
import { RefreshTokenError } from '@exceptions/RefreshTokenError';

import { log } from '@configs/logger';
import { usersService } from '@services/users';

interface UsersController {
    getGetUser?: RequestHandler;
    postRegisterUser?: RequestHandler;
    getRefreshJwtToken: RequestHandler;
    postLoginUser?: RequestHandler;
    putEditUser?: RequestHandler;
    deleteDeleteUser?: RequestHandler;
}

class UsersControllerImpl implements UsersController {
    public getRefreshJwtToken: RequestHandler = async (req, res) => {
        const refreshToken = req.headers['refresh-token'];
        if (!refreshToken)
            return res.status(401).json({ message: 'No refresh token provided!' } as TResponse);

        try {
            const serviceResponse = await usersService.refreshJwtToken(refreshToken, req.ip);
            res.status(200).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            if (error instanceof NoDataError || error instanceof RefreshTokenError) {
                log.warn(message);
                return res.status(401).json({ message } as TResponse);
            }
            log.err(stack ?? message);
            res.status(500).json({ message } as TResponse);
        }
    };

    public postLoginUser: RequestHandler = async (req, res) => {
        const { user: loginCredentials } = req.body as TUserJson<TUserLogin>;
        try {
            const serviceResponse = await usersService.loginUser(loginCredentials, req.ip);
            return res.status(200).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            if (error instanceof NoDataError) {
                log.warn(message);
                return res.status(401).json({ message } as TResponse);
            }
            log.err(stack ?? message);
            return res.status(500).json({ message } as TResponse);
        }
    };
}

export const usersController = new UsersControllerImpl();
