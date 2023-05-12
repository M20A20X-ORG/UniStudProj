import React, { FC, ReactNode, useContext, useState } from 'react';
import { TAuthState } from 'types/context/auth.context';
import { TServerResponse } from 'types/rest/responses/serverResponse';
import { TAuth, TUser } from 'types/rest/responses/auth';
import { TFuncResponse } from 'types/rest';
import { TUserJson, TUserLogIn } from 'types/rest/requests/user';

import { ModalContext } from 'context/Modal.context';
import { AuthContext } from 'context/Auth.context';

import { getApi } from 'utils/getApi';

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = (props) => {
    const { children } = props;
    const [authState, setAuthState] = useState<TAuthState>({ userId: null, userRole: null, isLoggedIn: false });

    const modalContext = useContext(ModalContext);

    /// ----- Handlers ----- ///
    const logout = (): void => setAuthState({ userId: null, userRole: null, isLoggedIn: false });

    const login = async (login: TUserLogIn): Promise<TFuncResponse> => {
        if (authState.isLoggedIn) {
            modalContext?.closeModal('custom');
            return { message: 'User already logged in!', type: 'error' };
        }

        const loginApi = getApi('login');
        const data: TUserJson<TUserLogIn> = { user: login };
        const requestInit: RequestInit = {
            method: 'POST',
            headers: { 'Content-type': 'application/json;charset=utf-8' },
            body: JSON.stringify(data)
        };

        try {
            const response = await fetch(loginApi, requestInit);
            const json = (await response.json()) as TServerResponse<TUser> & TAuth;

            const message = json?.message || response.statusText;
            const { payload, refreshToken, accessToken } = json || {};
            const { userId, role: userRole } = payload || {};

            if (!response.ok) return { message, type: 'error' };
            if (
                typeof userId !== 'number' ||
                typeof userRole !== 'string' ||
                typeof accessToken !== 'string' ||
                typeof refreshToken !== 'string'
            )
                return { message: `Incorrect response from server: ${message}`, type: 'error' };

            localStorage.setItem('access-token', accessToken);
            localStorage.setItem('refresh-token', refreshToken);

            setAuthState({ userId, userRole, isLoggedIn: true });
            return { message, type: 'info' };
        } catch (error: unknown) {
            const { message } = error as Error;
            return { message, type: 'error' };
        }
    };

    return <AuthContext.Provider value={{ ...authState, login, logout }}>{children}</AuthContext.Provider>;
};
