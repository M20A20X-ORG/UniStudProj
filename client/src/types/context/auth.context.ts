import { TUser } from 'types/schemas/auth';
import { TModalMessage } from 'types/context/modal.context';
import { TUserLogIn } from 'types/requests/login';

export type TAuthLogin = (login: TUserLogIn) => Promise<TModalMessage>;
export type TAuthLogout = () => void;

export type TAuthState = {
    user: TUser | null;
    isLoggedIn: boolean;
};

export type TAuthContext = TAuthState & { login: TAuthLogin; logout: TAuthLogout };
