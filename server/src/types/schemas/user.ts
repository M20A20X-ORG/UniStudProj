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

export type TUserId = Pick<TUser, 'userId'>;
export type TUserRegistration = Omit<TUser, 'userId' | 'role'> & { passwordConfirm: string };
export type TUserEdit = Pick<TUser, 'userId'> & Partial<TUserRegistration>;
export type TUserPublic = Omit<TUser, 'password'>;
