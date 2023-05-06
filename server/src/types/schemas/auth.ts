import { TUser, TUserId } from '@type/schemas/user';

export type TAuthPayload = TUserId & Pick<TUser, 'role'>;
export type TUserLogin = Pick<TUser, 'username' | 'password'>;
export type TRefreshToken = TUserId & {
    token: string;
    expireDate: number;
    accessIp: string;
};
