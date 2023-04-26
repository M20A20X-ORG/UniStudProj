import { TUser } from '@type/schemas/user';

export type TAuthPayload = Pick<TUser, 'userId' | 'role'>;
export type TPartialKey<T> = {
    [key: string]: Partial<T> & { [key: string]: any };
};
export type TUserLogin = Pick<TUser, 'username' | 'password'>;
export type TRefreshToken = {
    token: string;
    expireDate: Date;
    userId: number;
    accessIp: string;
};
