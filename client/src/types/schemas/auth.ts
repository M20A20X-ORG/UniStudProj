export type TAuth = {
    accessToken: string;
    refreshToken: string;
};

export type TUser = {
    userId: number;
    role: string;
    username: string;
    name: string;
    email: string;
    about?: string;
    group: string;
};

export type TUserJson<T> = { user: T };
