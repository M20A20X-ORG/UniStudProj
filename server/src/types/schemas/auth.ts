import { TUser, TUserId, TUserPrivate } from '@type/schemas/user';

export type TUserAuthPayload = TUserId & Pick<TUser, 'role'>;
export type TAuthPayload = TUserAuthPayload & {
    accessToken: string;
    refreshToken: string;
};
export type TUserLogin = Pick<TUserPrivate, 'username' | 'password'>;
export type TRefreshToken = TUserId & {
    token: string;
    expireDate: string;
    accessIp: string;
};
