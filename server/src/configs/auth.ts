import { env } from 'process';

import { Request, Response } from 'express';
import {
    Algorithm,
    JwtPayload,
    Secret,
    sign,
    SignOptions,
    verify,
    VerifyOptions
} from 'jsonwebtoken';
import { TUserTokenPayload } from '@type/schemas/user';

import { log } from '@configs/logger';
import { InvalidAccessRolesError } from '@exceptions/InvalidAccessRolesError';

interface Auth {
    readonly ACCESS_ROLE: { [key: string]: string };
    encodeSession: (payload: TUserTokenPayload) => string;
    validateToken: (req: Request, res: Response) => void;
    authorizeAccess: (requiredRoles: string[], req: Request, res: Response) => void;
}

class AuthImpl implements Auth {
    private readonly ACCESS_ROLE_PREFIX = 'ROLE_';
    public readonly ACCESS_ROLE = {
        admin: this.ACCESS_ROLE_PREFIX + 'ADMINISTRATOR',
        user: this.ACCESS_ROLE_PREFIX + 'USER'
    };

    constructor() {
        Object.keys(this.ACCESS_ROLE).every((key) => {
            const roleKey = key as keyof typeof this.ACCESS_ROLE;
            if (!this.ACCESS_ROLE[roleKey].startsWith(this.ACCESS_ROLE_PREFIX))
                throw new InvalidAccessRolesError(this.ACCESS_ROLE[roleKey]);
        });
    }

    public encodeSession = (payload: TUserTokenPayload): string => {
        const secret = env.JWT_SECRET as Secret;
        const signOptions: SignOptions = {
            expiresIn: env.JWT_EXPIRE_TIME as string,
            algorithm: env.JWT_ALGORITHM as Algorithm
        };
        return sign(payload, secret, signOptions);
    };

    public validateToken = (req: Request, res: Response): void => {
        const jwt = req.headers.authorization as string;
        const secret = env.JWT_SECRET as Secret;
        const verifyOptions: VerifyOptions = {
            algorithms: [env.JWT_ALGORITHM as Algorithm]
        };

        if (!jwt) {
            log.warn('No Authorization header!');
            res.sendStatus(401);
        }

        const token = jwt.slice('Bearer '.length);
        verify(token, secret, verifyOptions, (err, user) => {
            if (err) {
                log.warn(err.message);
                res.sendStatus(403);
            }
            req.user = user as JwtPayload;
        });
    };

    public authorizeAccess = (requiredRoles: string[], req: Request, res: Response): void => {
        const { role: accessRole } = req.user as JwtPayload;
        if (!accessRole) res.sendStatus(401);
        else if (requiredRoles.find(accessRole)) res.sendStatus(403);
    };
}

export const auth = new AuthImpl();
export const { ACCESS_ROLE } = auth;
