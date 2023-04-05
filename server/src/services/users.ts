import { TUser, TUserAuth, TUserDB, TUserDBPartial } from '@type/schemas/user';

interface IUsersService {
    getUser?: (userIdentifier: number | string) => TUserDB;
    registerUser?: (userData: TUser) => string;
    loginUser?: (userCredentials: TUserAuth) => TUserDB;
    editUser?: (userData: TUserDBPartial) => string;
    deleteUser?: (userId: number) => string;
}

class UsersService implements IUsersService {}

export const usersService = new UsersService();
