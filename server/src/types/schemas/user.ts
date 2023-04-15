import { TAuthPayload } from '@type/schemas/auth';

declare module 'http' {
    interface IncomingHttpHeaders {
        'refresh-token'?: string;
    }
}

declare module 'express-serve-static-core' {
    interface Request {
        user: TAuthPayload | undefined;
    }
}

export type TUser = {
    userId: number;
    role: string;
    username: string;
    password: string;
    name: string;
    email: string;
    about?: string;
    group: string;
};

export type TUserJson<T> = { user: T };

export type TUserRegistration = Omit<TUser, 'userId' | 'role'> & { passwordConfirm: string };
export type TUserPartial = Pick<TUser, 'userId'> & Partial<TUserRegistration>;
export type TUserPublic = Omit<TUser, 'password'>;
