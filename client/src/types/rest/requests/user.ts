import { TUser } from 'types/rest/responses/auth';

export type TUserLogIn = { username: string; password: string };
export type TUserRegistration = Omit<TUser, 'userId' | 'role'> & {
    password: string;
    passwordConfirm: string;
};
export type TUserEdit = Pick<TUser, 'userId'> & Partial<TUserRegistration>;
