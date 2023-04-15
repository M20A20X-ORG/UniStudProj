import { TUser, TUserPartial } from '@type/schemas/user';

interface UsersService {
    getUser?: (userIdentifier: number | string) => TUser;
    registerUser?: (userData: TUser) => string;
    editUser?: (userData: TUserPartial) => string;
    deleteUser?: (userId: number) => string;
}

class UsersServiceImpl implements UsersService {}

export const usersService = new UsersServiceImpl();
