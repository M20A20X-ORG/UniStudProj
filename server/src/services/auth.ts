import { compareSync } from 'bcrypt';

import { TAuthPayload, TRefreshToken, TUserLogin } from '@type/schemas/auth';
import { TAuthResponse, TLoginResponse, TPayloadResponse } from '@type/schemas/response';
import { TUser } from '@type/schemas/user';

import { NoDataError } from '@exceptions/NoDataError';
import { RefreshTokenError } from '@exceptions/RefreshTokenError';

import { log } from '@configs/logger';
import { sqlPool } from '@configs/sqlPool';
import { auth } from '@configs/auth';

interface AuthService {
    refreshJwtToken: (
        refreshToken: string,
        accessIp: string
    ) => Promise<TPayloadResponse<TAuthResponse>>;
    loginUser: (userCredentials: TUserLogin, accessIp: string) => Promise<TLoginResponse>;
}

class AuthServiceImpl implements AuthService {
    public refreshJwtToken = async (
        refreshToken: string,
        accessIp: string
    ): Promise<TPayloadResponse<TAuthResponse>> => {
        const sql = {
            selectToken: `SELECT user_id AS userId, access_ip AS accessIp, expire_date AS expireDate, token
                    FROM tbl_user_refresh_tokens
                    WHERE token = ?`,
            selectUser: `SELECT u.user_id AS userId,
                          ur.name   AS role
                   FROM (SELECT *
                         FROM tbl_users
                         WHERE user_id = ?) AS u
                            JOIN tbl_user_roles ur ON ur.role_id = u.role_id`,
            deleteToken: `DELETE
                    FROM tbl_user_refresh_tokens
                    WHERE token = ?`
        };

        const dbTokenResponse = await sqlPool.query(sql.selectToken, [refreshToken]);
        const [[dbToken]] = dbTokenResponse;
        if (!dbToken)
            throw new RefreshTokenError('No session found for this token - please, login first!');

        const { accessIp: lastAccessIp, expireDate, userId } = dbToken as TRefreshToken;
        if (accessIp !== lastAccessIp)
            throw new RefreshTokenError('Ip change detected - please, log in again!');
        if (new Date(expireDate).getTime() < new Date().getTime()) {
            const dbDeletionResponse = await sqlPool.query(sql.deleteToken, [refreshToken]);
            log.debug(dbDeletionResponse);
            throw new RefreshTokenError('Session was expired - please, login again!');
        }

        const dbUserResponse = await sqlPool.query(sql.selectUser, [userId]);
        const [[dbUser]] = dbUserResponse;
        if (!dbUser) throw new NoDataError(`No user was found for this session`);

        const accessToken = auth.createJwtToken(dbUser as TAuthPayload);
        return {
            message: `Successfully refreshed access token!`,
            payload: { accessToken, refreshToken }
        };
    };

    public loginUser = async (
        userCredentials: TUserLogin,
        accessIp: string
    ): Promise<TLoginResponse> => {
        log.debug(`Logging user: ${JSON.stringify(userCredentials)}`);

        const { username, password } = userCredentials;
        const sql = {
            selectUserData: `SELECT u.user_id  AS userId,
                              u.password AS passwordHash,
                              ur.name    AS role,
                              u.*
                       FROM (SELECT *
                             FROM tbl_users
                             WHERE username = ?
                               AND password = ?) AS u
                                JOIN tbl_user_roles ur ON ur.role_id = u.role_id`,
            insertRefreshToken: `INSERT INTO tbl_user_refresh_tokens(token, user_id, access_ip, expire_date)
                           VALUES (?, ?, ?, ?)`
        };

        const dbUserDataResponse = await sqlPool.query(sql.selectUserData, [username, password]);
        const [[dbUserData]] = dbUserDataResponse;
        if (!dbUserData) throw new NoDataError('No user found for this credentials!');

        const { password: passwordHash = '', ...user } = dbUserData as TUser;
        if (!compareSync(password, passwordHash))
            throw new NoDataError(`Incorrect username or password!`);

        const accessToken = auth.createJwtToken({ username, role: user.role });
        const { token: refreshToken, expireDate } = auth.createRefreshToken();
        await sqlPool.query(sql.insertRefreshToken, [
            refreshToken,
            user.userId,
            accessIp,
            expireDate
        ]);

        return new Promise((res) =>
            res({
                message: `Successfully logged in user, username: ${username}`,
                payload: user,
                accessToken,
                refreshToken
            })
        );
    };
}

export const authService = new AuthServiceImpl();
