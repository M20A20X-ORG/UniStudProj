import { TUser } from '@type/schemas/user';

export type TAuthPayload = Pick<TUser, 'username' | 'role'>;
export type TUserLogin = Pick<TUser, 'username' | 'password'>;
export type TRefreshToken = {
    token: string;
    expireDate: Date;
    userId: number;
    accessIp: string;
};
