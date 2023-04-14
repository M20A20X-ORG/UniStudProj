import { TPayloadResponse, TResponse } from '@type/schemas/response';
import { TUser, TUserPartial } from '@type/schemas/user';

import { DataDeletionError } from '@exceptions/DataDeletionError';
import { NoDataError } from '@exceptions/NoDataError';

import { sqlPool } from '@configs/sqlPool';

interface UsersService {
    getUser: (userIdentifier: number | string) => Promise<TPayloadResponse<TUser>>;
    registerUser?: (userData: TUser) => Promise<TResponse>;
    editUser?: (userData: TUserPartial) => Promise<TPayloadResponse<TUser>>;
    deleteUser: (userId: number) => Promise<TResponse>;
}

class UsersServiceImpl implements UsersService {
    public deleteUser = async (userId: number): Promise<TResponse> => {
        const sql = {
            selectUserEmail: `SELECT email
                        FROM tbl_users
                        WHERE user_id = ?`,
            deleteUser: `DELETE
                   FROM tbl_users
                   WHERE user_id = ?`
        };
        const dbUserEmailResponse = await sqlPool.query(sql.selectUserEmail, userId);
        const [[dbUserEmail]] = dbUserEmailResponse;
        if (!dbUserEmail) throw new DataDeletionError(`No user found, id: '${userId}'`);

        const { email } = dbUserEmail;
        await sqlPool.query(sql.deleteUser, userId);

        return new Promise<TResponse>((resolve) =>
            resolve({
                message: `Successfully deleted user, email: '${email}'`
            })
        );
    };

    public getUser = async (userIdentifier: number | string): Promise<TPayloadResponse<TUser>> => {
        const sql = `SELECT u.user_id AS userId,
                        ur.name   AS role,
                        u.*
                 FROM (SELECT user_id,
                              role_id,
                              name,
                              email,
                              password,
                              username,
                              about,
                              'group'
                       FROM tbl_users
                       WHERE ${
                           typeof userIdentifier === 'string' ? 'username' : 'user_id'
                       } = ?) AS u
                          JOIN tbl_user_roles ur ON ur.role_id = u.role_id`;

        const dbUserResponse = await sqlPool.query(sql, userIdentifier);
        const [[dbUser]] = dbUserResponse;
        if (!dbUser) throw new NoDataError(`No user found, identifier: '${userIdentifier}'`);

        return {
            message: `Successfully got user, identifier: '${userIdentifier}'`,
            payload: dbUser
        };
    };
}

export const usersService = new UsersServiceImpl();
