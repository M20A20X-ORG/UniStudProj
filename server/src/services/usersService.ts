import { QueryError } from 'mysql2';
import { PoolConnection } from 'mysql2/promise';
import { TModifyQueryResponse, TReadQueryResponse } from '@type/sql';
import { TResponse } from '@type/schemas/response';
import { TUser, TUserEdit, TUserRegistration } from '@type/schemas/user';

import { DataAddingError } from '@exceptions/DataAddingError';
import { DataDeletionError } from '@exceptions/DataDeletionError';
import { NoDataError } from '@exceptions/NoDataError';
import { DataModificationError } from '@exceptions/DataModificationError';

import { DEFAULT_ACCESS_ROLE_ID } from '@configs/authConfig';
import { USER_SQL } from '@static/sql/user';

import { hashPassword } from '@utils/hashPassword';

import { sqlPool } from '@configs/sqlPoolConfig';
import { log } from '@configs/loggerConfig';

const { createSql, readSql, updateSql, deleteSql } = USER_SQL;

interface UsersService {
    getUsers: (
        userIdentifiers: Array<number | string>,
        limit: number
    ) => Promise<TResponse<TUser[]>>;
    registerUser: (userData: TUserRegistration) => Promise<TResponse>;
    editUser: (userData: TUserEdit) => Promise<TResponse>;
    deleteUser: (userId: number) => Promise<TResponse>;
}

class UsersServiceImpl implements UsersService {
    public registerUser = async (userData: TUserRegistration): Promise<TResponse> => {
        const { insertUser } = createSql;
        const { email, username, imgUrl, password, passwordConfirm, name, group, about } = userData;

        if (password !== passwordConfirm) throw new DataAddingError("Passwords don't match");

        const passwordHash = hashPassword(password);

        const connection: PoolConnection = await sqlPool.getConnection();
        try {
            const dbUserResponse: TModifyQueryResponse = await connection.query(insertUser, [
                DEFAULT_ACCESS_ROLE_ID,
                name.trim(),
                imgUrl ? imgUrl.trim() : null,
                email.trim(),
                passwordHash.trim(),
                username.trim(),
                about.trim(),
                group.trim()
            ]);
            log.debug(dbUserResponse);

            await connection.commit();
            return { message: `Successfully registered new user, email: ${userData.username}` };
        } catch (error: unknown) {
            await connection.rollback();
            const { code } = error as QueryError;
            if (code === 'ER_DUP_ENTRY')
                return { message: `User '${username}' already registered!` };
            else throw error;
        } finally {
            connection.release();
        }
    };

    public getUsers = async (
        userIdentifiers: Array<number | string>,
        limit?: number
    ): Promise<TResponse<TUser[]>> => {
        const { getSelectUsers } = readSql;

        const selectUsersSql = getSelectUsers(userIdentifiers, limit);
        const dbUsersResponse: TReadQueryResponse = await sqlPool.query(
            selectUsersSql,
            userIdentifiers
        );
        const [dbUsers] = dbUsersResponse;
        if (!dbUsers.length) {
            throw new NoDataError(
                `No users found, identifiers: '${JSON.stringify(userIdentifiers)}'`
            );
        }

        const payload = dbUsers as TUser[];
        return {
            message: `Successfully got users`,
            payload
        };
    };

    public editUser = async (userData: TUserEdit): Promise<TResponse> => {
        const { getUpdateUsers } = updateSql;
        const { passwordConfirm, ...userCommon } = userData;
        const { userId, password } = userCommon;

        if (password !== passwordConfirm) throw new DataModificationError("Passwords don't match");

        const passwordHash = password ? hashPassword(password) : undefined;
        const updateUsersSql = getUpdateUsers({ ...userCommon, passwordHash });
        const dbUserResponse: TModifyQueryResponse = await sqlPool.query(updateUsersSql);
        log.debug(dbUserResponse);

        const { payload: users } = await this.getUsers([userId]);
        if (!users) return { message: `User, id: ${userId} are not found!` };

        return { message: 'Successfully update user data!' };
    };

    public deleteUser = async (userId: number): Promise<TResponse> => {
        const { selectUserEmail, deleteUser } = deleteSql;

        const dbUserEmailResponse: TReadQueryResponse = await sqlPool.query(
            selectUserEmail,
            userId
        );
        const [[dbUserEmail]] = dbUserEmailResponse;
        if (!dbUserEmail) throw new DataDeletionError(`No user found, id: '${userId}'`);

        const { email } = dbUserEmail;
        const dbUserResponse: TModifyQueryResponse = await sqlPool.query(deleteUser, userId);
        log.debug(dbUserResponse);

        return {
            message: `Successfully deleted user, email: '${email}'`
        };
    };
}

export const usersService = new UsersServiceImpl();
