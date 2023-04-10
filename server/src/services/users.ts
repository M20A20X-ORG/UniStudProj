import { compareSync } from 'bcrypt';

import { TUser, TUserAuth, TUserPartial } from '@type/schemas/user';
import { TAuthResponse } from '@type/schemas/response';

import { NoDataError } from '@exceptions/NoDataError';

import { log } from '@configs/logger';
import { sqlPool } from '@configs/sqlPool';
import { auth } from '@configs/auth';

interface UsersService {
    getUser?: (userIdentifier: number | string) => TUser;
    registerUser?: (userData: TUser) => string;
    loginUser: (userCredentials: TUserAuth) => Promise<TAuthResponse>;
    editUser?: (userData: TUserPartial) => string;
    deleteUser?: (userId: number) => string;
}

class UsersServiceImpl implements UsersService {
    public loginUser = async (userCredentials: TUserAuth): Promise<TAuthResponse> => {
        log.debug(`Logging user: ${JSON.stringify(userCredentials || {})}`);

        const { username, password } = userCredentials || {};
        const sql = `SELECT u.user_id  AS userId,
                        u.password AS passwordHash,
                        ur.name    AS role,
                        u.*
                 FROM (SELECT *
                       FROM tbl_users
                       WHERE username = ?
                         AND password = ?) AS u
                          JOIN tbl_user_roles ur ON ur.role_id = u.role_id`;

        const dbResponse = await sqlPool.query(sql, [username, password]);
        const [[dbUserData]] = dbResponse;
        const { password: passwordHash = '', ...user } = dbUserData as TUser;
        if (!compareSync(password, passwordHash))
            throw new NoDataError(`Incorrect username or password!`);

        const accessToken = auth.encodeSession({ username, role: user.role });
        return new Promise((res) =>
            res({
                message: `Successfully logged in user, username: ${username}`,
                payload: user,
                accessToken
            })
        );
    };
}

export const usersService = new UsersServiceImpl();
