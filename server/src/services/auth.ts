import { compareSync } from 'bcrypt';

import { QueryError } from 'mysql2';
import { TReadQueryResponse, TModifyQueryResponse } from '@type/sql';
import { TAuthPayload, TRefreshToken, TUserLogin } from '@type/schemas/auth';
import { TAuthResponse, TPayloadResponse } from '@type/schemas/response';
import { TUser, TUserPublic } from '@type/schemas/user';

import { NoDataError } from '@exceptions/NoDataError';
import { RefreshTokenError } from '@exceptions/RefreshTokenError';

import { AUTH_SQL } from '@static/sql/auth';

import { log } from '@configs/logger';
import { sqlPool } from '@configs/sqlPool';
import { auth } from '@configs/auth';

type TLoginResponse = TAuthResponse & TPayloadResponse<TUserPublic>;

const { refreshTokenSql, loginSql } = AUTH_SQL;

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
        const { selectToken, deleteToken, selectUser } = refreshTokenSql;

        const dbTokenResponse: TReadQueryResponse = await sqlPool.query(selectToken, [
            refreshToken
        ]);
        const [[dbToken]] = dbTokenResponse;
        if (!dbToken)
            throw new RefreshTokenError('No session found for this token - please, login first!');

        const { accessIp: lastAccessIp, expireDate, userId } = dbToken as TRefreshToken;
        if (accessIp !== lastAccessIp)
            throw new RefreshTokenError('Ip change detected - please, log in again!');
        if (new Date(expireDate).getTime() < new Date().getTime()) {
            const dbDeletionResponse: TModifyQueryResponse = await sqlPool.query(deleteToken, [
                refreshToken
            ]);
            log.debug(dbDeletionResponse);
            throw new RefreshTokenError('Session was expired - please, login again!');
        }

        const dbUserResponse: TReadQueryResponse = await sqlPool.query(selectUser, [userId]);
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
        const { username, password } = userCredentials;
        const { selectUserData, insertRefreshToken } = loginSql;

        const dbUserDataResponse: TReadQueryResponse = await sqlPool.query(selectUserData, [
            username,
            password
        ]);
        const [[dbUserData]] = dbUserDataResponse;
        if (!dbUserData) throw new NoDataError('No user found for this credentials!');

        const { password: passwordHash = '', ...user } = dbUserData as TUser;
        const isPasswordCorrect = compareSync(password, passwordHash);
        if (!isPasswordCorrect) throw new NoDataError(`Incorrect username or password!`);

        const accessToken: string = auth.createJwtToken({ userId: user.userId, role: user.role });
        const { token: refreshToken, expireDate } = auth.createRefreshToken();

        try {
            const dbRefreshTokenResponse: TModifyQueryResponse = await sqlPool.query(
                insertRefreshToken,
                [refreshToken, user.userId, accessIp, expireDate]
            );
            log.debug(dbRefreshTokenResponse);
        } catch (error: unknown) {
            const { code } = error as QueryError;
            if (code === 'ER_DUP_ENTRY')
                throw new RefreshTokenError(`User '${username}' already logged in!`);
            else throw error;
        }

        return {
            message: `Successfully logged in user, username: ${username}`,
            payload: user,
            accessToken,
            refreshToken
        };
    };
}

export const authService = new AuthServiceImpl();
