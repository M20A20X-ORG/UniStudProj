import { TFuncResponse } from 'types/rest';
import { TUserLogIn } from 'types/rest/requests/user';

export type TAuthLogin = (login: TUserLogIn) => Promise<TFuncResponse>;
export type TAuthLogout = () => void;

export type TAuthState = {
    userId: number | null;
    userRole: string | null;
    isLoggedIn: boolean;
};

export type TAuthContext = TAuthState & { login: TAuthLogin; logout: TAuthLogout };
