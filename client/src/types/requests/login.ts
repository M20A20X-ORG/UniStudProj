export type TUserLogIn = { username: string; password: string };
export type TUserRegistration = {
    username: string;
    password: string;
    passwordConfirm: string;
    name: string;
    email: string;
    about?: string;
    group: string;
};
