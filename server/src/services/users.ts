import { QueryError } from 'mysql2';

import { TPayloadResponse, TResponse } from '@type/schemas/response';
import { TUserPartial, TUserPublic, TUserRegistration } from '@type/schemas/user';

import { DEFAULT_ACCESS_ROLE_ID } from '@configs/auth';

import { DataAddingError } from '@exceptions/DataAddingError';
import { DataDeletionError } from '@exceptions/DataDeletionError';
import { NoDataError } from '@exceptions/NoDataError';
import { DataModificationError } from '@exceptions/DataModificationError';

import { concat } from '@utils/concat';
import { hashPassword } from '@utils/hashPassword';

import { sqlPool } from '@configs/sqlPool';

interface UsersService {
    getUser: (userIdentifier: number | string) => Promise<TPayloadResponse<TUserPublic>>;
    registerUser: (userData: TUserRegistration) => Promise<TResponse>;
    editUser: (userData: TUserPartial) => Promise<TPayloadResponse<TUserPublic>>;
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

    public getUser = async (
        userIdentifier: number | string
    ): Promise<TPayloadResponse<TUserPublic>> => {
        const sql = `SELECT u.user_id AS userId,
                        ur.name   AS role,
                        u.email,
                        u.username,
                        u.name,
                        u.about,
                        u.group
                 FROM (SELECT user_id,
                              role_id,
                              name,
                              email,
                              password,
                              username,
                              about,
                              \`group\`
                       FROM tbl_users
                       WHERE ${
                           typeof userIdentifier === 'string' ? 'username' : 'user_id'
                       } = ?) AS u
                          JOIN tbl_user_roles ur ON ur.role_id = u.role_id`;

        const dbUserResponse = await sqlPool.query(sql, userIdentifier);
        const [[dbUser]] = dbUserResponse;
        if (!dbUser) throw new NoDataError(`No user found, identifier: '${userIdentifier}'`);

        const payload = dbUser as TUserPublic;
        return {
            message: `Successfully got user, identifier: '${userIdentifier}'`,
            payload
        };
    };

    public registerUser = async (userData: TUserRegistration): Promise<TResponse> => {
        const { email, username, password, passwordConfirm, name, group, about } = userData;

        const sql = `INSERT INTO tbl_users(role_id, name, email, password, username, about, \`group\`)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;

        if (password !== passwordConfirm) throw new DataAddingError("Passwords don't match");

        const passwordHash = hashPassword(password);

        try {
            await sqlPool.query(sql, [
                DEFAULT_ACCESS_ROLE_ID,
                name.trim(),
                email.trim(),
                passwordHash,
                username.trim(),
                about ? about.trim() : null,
                group.trim()
            ]);
        } catch (error: unknown) {
            const { code } = error as QueryError;
            if (code === 'ER_DUP_ENTRY')
                throw new DataAddingError(`User '${username}' already registered!`);
            else throw error;
        }

        return {
            message: `Successfully registered new user, email: ${userData.username}`
        } as TResponse;
    };

    public editUser = async (userData: TUserPartial): Promise<TPayloadResponse<TUserPublic>> => {
        const { userId, email, username, password, passwordConfirm, name, group, about } = userData;

        if (password !== passwordConfirm) throw new DataModificationError("Passwords don't match");

        const sql = `UPDATE tbl_users
                 SET ${concat([
                     email ? "email = '" + email.trim() + "'" : '',
                     username ? "username = '" + username.trim() + "'" : '',
                     password ? "password = '" + hashPassword(password) + "'" : '',
                     name ? "name = '" + name.trim() + "'" : '',
                     group ? "`group` = '" + group.trim() + "'" : '',
                     about ? "about = '" + about.trim() + "'" : ''
                 ])}
                 WHERE user_id = ?`;

        await sqlPool.query(sql, [userId]);
        const { payload } = await this.getUser(userId);

        return {
            message: '',
            payload
        };
    };
}

export const usersService = new UsersServiceImpl();
