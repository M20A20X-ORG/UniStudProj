import { RequestHandler } from 'express';

interface UsersController {
    getGetUser?: RequestHandler;
    postRegisterUser?: RequestHandler;
    putEditUser?: RequestHandler;
    deleteDeleteUser?: RequestHandler;
}

class UsersControllerImpl implements UsersController {}

export const usersController = new UsersControllerImpl();
