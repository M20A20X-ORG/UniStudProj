export type TAccessRole = 'ROLE_ADMINISTRATOR' | 'ROLE_USER';

export const ACCESS_ROLE: { [key in TAccessRole]: string } = Object.freeze({
    ROLE_ADMINISTRATOR: 'Administrator',
    ROLE_USER: 'User'
});

export type TLogin = Pick<TUser, 'userId' | 'role'> & {
    accessToken: string;
    refreshToken: string;
};

export type TUser = {
    userId: number;
    role: string;
    username: string;
    imgUrl: string;
    name: string;
    email: string;
    about: string;
    group: string;
};
