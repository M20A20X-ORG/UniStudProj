export type TResponse = { message: string };
export type TPayloadResponse<T> = TResponse & { payload: T };
