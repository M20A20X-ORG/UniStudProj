import { TUser, TUserAuth, TUserPartial } from '@type/schemas/user';

interface IUsersService {
    getUser?: (userIdentifier: number | string) => TUser;
    registerUser?: (userData: TUser) => string;
    loginUser?: (userCredentials: TUserAuth) => TUser;
    editUser?: (userData: TUserPartial) => string;
    deleteUser?: (userId: number) => string;
}

class UsersService implements IUsersService {}

export const usersService = new UsersService();
