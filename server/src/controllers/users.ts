import { RequestHandler } from 'express';

interface IUsersController {
    getGetUser?: RequestHandler;
    postRegisterUser?: RequestHandler;
    postLoginUser?: RequestHandler;
    putEditUser?: RequestHandler;
    deleteDeleteUser?: RequestHandler;
}

class UsersController implements IUsersController {}

export const usersController = new UsersController();
