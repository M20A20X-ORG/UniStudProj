import { TUser } from 'types/user';

export type TAuthLogin = (email: string, password: string) => Promise<void>;
export type TAuthLogout = () => Promise<void>;

export type TAuthState = {
    user: null | TUser;
    isLoggedIn: boolean;
    isLoginPending: boolean;
    loginError: null | string;
};

export type TAuthContext = TAuthState & { login: TAuthLogin; logout: TAuthLogout };
