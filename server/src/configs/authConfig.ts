import * as process from 'process';
import { env } from 'process';
import { v4 } from 'uuid';

import {
    Algorithm,
    JsonWebTokenError,
    Secret,
    sign,
    SignOptions,
    verify,
    VerifyOptions
} from 'jsonwebtoken';
import { TAccessRole, TProjectAccessRole, TUserAccessRole } from '@type/auth';
import { TAuthPayload, TRefreshToken } from '@type/schemas/auth';
import { AuthorizationError } from '@exceptions/AuthorizationError';
import { AuthenticationError } from '@exceptions/AuthenticationError';

import { AUTH_SQL } from '@static/sql/auth';

import { sqlPool } from '@configs/sqlPoolConfig';
import { TReadQueryResponse } from '@type/sql';

interface Auth {
    readonly ACCESS_ROLE: { [key: string]: string };
    readonly DEFAULT_ACCESS_ROLE_ID: number;
    createJwtToken: (payload: TAuthPayload) => string;
    validateJwtToken: (authorizationHeader: string) => Promise<TAuthPayload>;
    authorizeAccess: (userData: TAuthPayload, requiredRoles: string[]) => void;
}

class AuthImpl implements Auth {
    ///// Public /////
    public readonly DEFAULT_ACCESS_ROLE_ID = 2;
    public readonly ACCESS_ROLE: TAccessRole<TUserAccessRole> = {
        admin: 'ROLE_ADMINISTRATOR',
        user: 'ROLE_USER'
    };
    public readonly PROJECT_ACCESS_ROLE: TAccessRole<TProjectAccessRole> = {
        owner: 'ROLE_PROJECT_OWNER',
        manager: 'ROLE_PROJECT_MANAGER',
        mentor: 'ROLE_PROJECT_MENTOR',
        developer: 'ROLE_PROJECT_DEVELOPER'
    };

    ///// Public /////

    public createRefreshToken = (): Pick<TRefreshToken, 'token' | 'expireDate'> => {
        const jwtRefreshExpireTime = parseInt(process.env.JWT_REFRESH_EXPIRE_TIME as string);
        const expireDate: number = new Date(
            new Date().getTime() + 1000 * jwtRefreshExpireTime
        ).getTime();
        return {
            token: v4(),
            expireDate
        };
    };

    public createJwtToken = (payload: TAuthPayload): string => {
        const secret = env.JWT_SECRET as Secret;
        const signOptions: SignOptions = {
            expiresIn: env.JWT_EXPIRE_TIME as string,
            algorithm: env.JWT_ALGORITHM as Algorithm
        };
        return sign(payload, secret, signOptions);
    };

    public validateJwtToken = (authorizationHeader: string): Promise<TAuthPayload> => {
        const secret = env.JWT_SECRET as Secret;
        const verifyOptions: VerifyOptions = {
            algorithms: [env.JWT_ALGORITHM as Algorithm]
        };

        if (!authorizationHeader) throw new JsonWebTokenError('No Authorization header!');
        const token = authorizationHeader.slice('Bearer '.length);

        return new Promise((resolve, reject) =>
            verify(token, secret, verifyOptions, (err, user) =>
                err ? reject(err) : resolve(user as TAuthPayload)
            )
        );
    };

    public authorizeAccess = (userData: TAuthPayload, requiredRoles: string[]): void => {
        const accessRole: string = userData.role;
        if (!accessRole) throw new AuthorizationError('No role!');
        if (!requiredRoles.includes(accessRole)) throw new AuthorizationError(accessRole);
    };

    public authorizeProjectAccess = async (
        projectId: number,
        userId: number,
        requiredProjectRoles: string[]
    ): Promise<void> => {
        const dbProjectRoleResponse: TReadQueryResponse = await sqlPool.query(
            AUTH_SQL.selectProjectRoleSql,
            [projectId, userId]
        );
        const [[dbProjectRole]] = dbProjectRoleResponse;
        if (!dbProjectRole) throw new AuthenticationError('Specified project are not exists!');

        const { projectRole } = dbProjectRole as { projectRole: string };
        if (!requiredProjectRoles.includes(projectRole)) throw new AuthorizationError(projectRole);
    };
}

export const auth = new AuthImpl();
export const { ACCESS_ROLE, PROJECT_ACCESS_ROLE, DEFAULT_ACCESS_ROLE_ID } = auth;
