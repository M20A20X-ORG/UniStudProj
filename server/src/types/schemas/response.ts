export type TResponse = { message: string };
export type TPayloadResponse<T> = TResponse & { payload: T };
export type TAuthResponse = {
    accessToken: string;
    refreshToken: string;
};
