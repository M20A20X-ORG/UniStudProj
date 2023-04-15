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

export type TUserAuth = Pick<TUser, 'username' | 'password'>;
export type TUserTokenPayload = Pick<TUser, 'username' | 'role'>;
export type TUserRegistration = Omit<TUser, 'userId' | 'role'>;
export type TUserPartial = Pick<TUser, 'userId'> & Partial<TUserRegistration>;
