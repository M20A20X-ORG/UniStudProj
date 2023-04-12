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
import { TAuthPayload, TRefreshToken } from '@type/schemas/auth';

import { InvalidAccessRolesError } from '@exceptions/InvalidAccessRolesError';
import { AuthorizationError } from '@exceptions/AuthorizationError';

interface Auth {
    readonly ACCESS_ROLE: { [key: string]: string };
    createJwtToken: (payload: TAuthPayload) => string;
    validateJwtToken: (authorizationHeader: string) => Promise<TAuthPayload>;
    authorizeAccess: (userData: TAuthPayload, requiredRoles: string[]) => void;
}

class AuthImpl implements Auth {
    private readonly _ACCESS_ROLE_PREFIX = 'ROLE_';
    public readonly ACCESS_ROLE = {
        admin: this._ACCESS_ROLE_PREFIX + 'ADMINISTRATOR',
        user: this._ACCESS_ROLE_PREFIX + 'USER'
    };

    constructor() {
        Object.keys(this.ACCESS_ROLE).every((key) => {
            const roleKey = key as keyof typeof this.ACCESS_ROLE;
            if (!this.ACCESS_ROLE[roleKey].startsWith(this._ACCESS_ROLE_PREFIX))
                throw new InvalidAccessRolesError(this.ACCESS_ROLE[roleKey]);
        });
    }

    public createRefreshToken = (): Pick<TRefreshToken, 'token' | 'expireDate'> => {
        const jwtRefreshExpireTime = parseInt(process.env.JWT_REFRESH_EXPIRE_TIME as string);
        const expireDate = new Date(new Date().getTime() + 1000 * jwtRefreshExpireTime);
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
        const accessRole = userData.role;
        if (!accessRole) throw new AuthorizationError('No role!');
        else if (!requiredRoles.includes(accessRole)) throw new AuthorizationError(accessRole);
    };
}

export const auth = new AuthImpl();
export const { ACCESS_ROLE } = auth;
