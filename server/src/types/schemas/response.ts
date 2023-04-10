import { TUser } from '@type/schemas/user';

export type TResponse = { message: string };
export type TPayloadResponse<T> = TResponse & { payload: T };
export type TAuthResponse = TPayloadResponse<Omit<TUser, 'password'>> & { accessToken: string };
