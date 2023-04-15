import { RequestHandler } from 'express';
import { TResponse } from '@type/schemas/response';

import { DataDeletionError } from '@exceptions/DataDeletionError';
import { NoDataError } from '@exceptions/NoDataError';

import { requireResponseBadQuery } from '@utils/responseBadQuery';
import { log } from '@configs/logger';
import { usersService } from '@services/users';

interface UsersController {
    getGetUser: RequestHandler;
    postRegisterUser?: RequestHandler;
    putEditUser?: RequestHandler;
    deleteDeleteUser: RequestHandler;
}

class UsersControllerImpl implements UsersController {
    public deleteDeleteUser: RequestHandler = async (req, res) => {
        const respBadQuery = requireResponseBadQuery("'userId' must be number > 0");

        const { userId: userIdParam } = req.query;
        if (typeof userIdParam !== 'string') return respBadQuery(res);
        const userId = parseInt(userIdParam);
        if (isNaN(userId) || userId <= 0) return respBadQuery(res);

        try {
            const serviceResponse = await usersService.deleteUser(userId);
            return res.status(200).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            if (error instanceof DataDeletionError) {
                log.warn(message);
            } else {
                log.err(stack ?? message);
            }
            return res.status(500).json({ message } as TResponse);
        }
    };

    public getGetUser: RequestHandler = async (req, res) => {
        const respBadQuery = requireResponseBadQuery(
            "'user' must be string with length > 3 or number > 0"
        );

        const { user: userIdentifier } = req.query;
        if (typeof userIdentifier !== 'string') return respBadQuery(res);
        const userId = parseInt(userIdentifier);
        if (!isNaN(userId) ? userId <= 0 : userIdentifier.length < 3) return respBadQuery(res);

        try {
            const serviceResponse = await usersService.getUser(userId || userIdentifier);
            return res.status(200).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            if (error instanceof NoDataError) {
                log.warn(message);
            } else {
                log.err(stack ?? message);
            }
            return res.status(500).json({ message } as TResponse);
        }
    };
}

export const usersController = new UsersControllerImpl();
