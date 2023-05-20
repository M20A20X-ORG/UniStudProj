export type TUser = {
    userId: number;
    role: string;
    imgUrl: string | null;
    username: string;
    name: string;
    email: string;
    about: string;
    group: string;
};

export type TUserJson<T> = { user: T };

export type TUserId = Pick<TUser, 'userId'>;
export type TUserPrivate = TUser & { password: string };
export type TUserRegistration = Omit<TUserPrivate, 'userId' | 'role'> & { passwordConfirm: string };
export type TUserEdit = TUserId & Partial<TUserRegistration>;
