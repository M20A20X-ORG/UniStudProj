import { RequestHandler } from 'express';
import { TUserEdit, TUserJson, TUserRegistration } from '@type/schemas/user';

import { DataDeletionError } from '@exceptions/DataDeletionError';
import { NoDataError } from '@exceptions/NoDataError';
import { DataAddingError } from '@exceptions/DataAddingError';
import { DataModificationError } from '@exceptions/DataModificationError';

import { sendResponse } from '@utils/sendResponse';

import { usersService } from '@services/usersService';

interface UsersController {
    getGetUser: RequestHandler;
    postRegisterUser: RequestHandler;
    putEditUser: RequestHandler;
    deleteDeleteUser: RequestHandler;
}

class UsersControllerImpl implements UsersController {
    public deleteDeleteUser: RequestHandler = async (req, res) => {
        try {
            const { userId: userIdParam } = req.query;
            const userId = parseInt(userIdParam as string);

            const serviceResponse = await usersService.deleteUser(userId);
            return res.status(204).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            let responseStatus = 500;
            if (error instanceof DataDeletionError) responseStatus = 409;
            return sendResponse(res, responseStatus, message, stack);
        }
    };

    public getGetUser: RequestHandler = async (req, res) => {
        try {
            const userIdentifiers = req.query.userIdentifiers as string[];
            const userIds = userIdentifiers.map((id) => parseInt(id));
            const isIdsCorrect = userIds.every((id) => !isNaN(id));

            const serviceResponse = await usersService.getUsers(
                isIdsCorrect ? userIds : userIdentifiers
            );
            return res.status(200).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            let responseStatus = 500;
            if (error instanceof NoDataError) responseStatus = 404;
            return sendResponse(res, responseStatus, message, stack);
        }
    };

    public postRegisterUser: RequestHandler = async (req, res) => {
        try {
            const { user } = req.body as TUserJson<TUserRegistration>;
            const serviceResponse = await usersService.registerUser(user);
            return res.status(201).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            let responseStatus = 500;
            if (error instanceof DataAddingError) responseStatus = 409;
            return sendResponse(res, responseStatus, message, stack);
        }
    };

    public putEditUser: RequestHandler = async (req, res) => {
        try {
            const { user } = req.body as TUserJson<TUserEdit>;
            const serviceResponse = await usersService.editUser(user);
            return res.status(201).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            let responseStatus = 500;
            if (error instanceof DataModificationError) responseStatus = 409;
            return sendResponse(res, responseStatus, message, stack);
        }
    };
}

export const usersController = new UsersControllerImpl();
