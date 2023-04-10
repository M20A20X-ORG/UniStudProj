import { RequestHandler } from 'express';
import { TResponse } from '@type/schemas/response';
import { TUserAuth, TUserJson } from '@type/schemas/user';

import { NoDataError } from '@exceptions/NoDataError';

import { log } from '@configs/logger';
import { usersService } from '@services/users';

interface UsersController {
    getGetUser?: RequestHandler;
    postRegisterUser?: RequestHandler;
    postLoginUser?: RequestHandler;
    putEditUser?: RequestHandler;
    deleteDeleteUser?: RequestHandler;
}

class UsersControllerImpl implements UsersController {
    public postLoginUser: RequestHandler = async (req, res) => {
        const { user: loginCredentials } = (req.body as TUserJson<TUserAuth>) || {};
        try {
            const serviceResponse = await usersService.loginUser(loginCredentials);
            res.status(200).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            if (error instanceof NoDataError) {
                log.warn(message);
                res.status(401).json({ message } as TResponse);
            } else {
                log.err(stack ?? message);
            }
            res.status(500).json({ message } as TResponse);
        }
    };
}

export const usersController = new UsersControllerImpl();
