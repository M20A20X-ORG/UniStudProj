import { RequestHandler } from 'express';
import { TResponse } from '@type/schemas/response';
import { TUserJson, TUserPartial, TUserRegistration } from '@type/schemas/user';

import { DataDeletionError } from '@exceptions/DataDeletionError';
import { NoDataError } from '@exceptions/NoDataError';
import { DataAddingError } from '@exceptions/DataAddingError';
import { DataModificationError } from '@exceptions/DataModificationError';

import { log } from '@configs/logger';
import { usersService } from '@services/users';

interface UsersController {
    getGetUser: RequestHandler;
    postRegisterUser: RequestHandler;
    putEditUser: RequestHandler;
    deleteDeleteUser: RequestHandler;
}

class UsersControllerImpl implements UsersController {
    public deleteDeleteUser: RequestHandler = async (req, res) => {
        const { userId: userIdParam } = req.query;
        const userId = parseInt(userIdParam as string);

        try {
            const serviceResponse = await usersService.deleteUser(userId);
            return res.status(204).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            if (error instanceof DataDeletionError) {
                log.warn(message);
                return res.status(409).json({ message } as TResponse);
            }
            log.err(stack ?? message);
            return res.status(500);
        }
    };

    public getGetUser: RequestHandler = async (req, res) => {
        const userIdentifiers = req.query.userIdentifiers as string[];
        const userIds = userIdentifiers.map((id) => parseInt(id));
        const isIdsCorrect = userIds.every((id) => !isNaN(id));

        try {
            const serviceResponse = await usersService.getUsers(
                ...(isIdsCorrect ? userIds : userIdentifiers)
            );
            return res.status(200).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            if (error instanceof NoDataError) {
                log.warn(message);
                return res.status(404).json({ message } as TResponse);
            }
            log.err(stack ?? message);
            return res.sendStatus(500);
        }
    };

    public postRegisterUser: RequestHandler = async (req, res) => {
        const { user } = req.body as TUserJson<TUserRegistration>;

        try {
            const serviceResponse = await usersService.registerUser(user);
            return res.status(201).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            if (error instanceof DataAddingError) {
                log.warn(message);
                return res.status(409).json({ message } as TResponse);
            }
            log.err(stack ?? message);
            return res.sendStatus(500);
        }
    };

    public putEditUser: RequestHandler = async (req, res) => {
        const { user } = req.body as TUserJson<TUserPartial>;

        try {
            const serviceResponse = await usersService.editUser(user);
            return res.status(201).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            if (error instanceof DataModificationError) {
                log.warn(message);
                return res.status(409).json({ message } as TResponse);
            }
            log.err(stack ?? message);
            return res.sendStatus(500);
        }
    };
}

export const usersController = new UsersControllerImpl();
