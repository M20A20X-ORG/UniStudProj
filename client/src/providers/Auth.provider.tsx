import React, { FC, ReactNode, useContext, useState } from 'react';
import { TPayloadResponse } from 'types/schemas/serverResponse';
import { TModalMessage } from 'types/context/modal.context';
import { TAuthState } from 'types/context/auth.context';
import { TAuth, TUser, TUserJson } from 'types/schemas/auth';
import { TUserLogIn } from 'types/requests/login';

import { ModalContext } from 'context/Modal.context';
import { AuthContext } from 'context/Auth.context';

import { validateSchema } from 'utils/validateSchema';
import { getApi } from 'utils/getApi';

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = (props) => {
    const { children } = props;
    const [authState, setAuthState] = useState<TAuthState>({ user: null, isLoggedIn: false });

    const modalContext = useContext(ModalContext);

    /// ----- Handlers ----- ///
    const logout = (): void => setAuthState({ user: null, isLoggedIn: false });

    const login = async (login: TUserLogIn): Promise<TModalMessage> => {
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

        let user = null,
            message = null;

        try {
            const response = await fetch(loginApi, requestInit);
            const text = await response.text();
            if (!text) return { message: 'Empty response from server', type: 'error' };

            const json = JSON.parse(text) as TPayloadResponse<TUser> & TAuth;
            message = json.message;

            localStorage.setItem('accessToken', json.accessToken);
            localStorage.setItem('refreshToken', json.refreshToken);

            if (!response.ok) return { message, type: 'error' };

            user = json.payload;
            const validationResult = validateSchema<TUser>(user, 'http://example.com/schema/user');
            if (validationResult)
                return { message: `Incorrect response from server: ${validationResult.message}`, type: 'error' };
        } catch (error: unknown) {
            if (error instanceof Error) return { message: error.message, type: 'error' };
        }
        setAuthState({ user: user as TUser, isLoggedIn: true });
        return { message: message as string, type: 'info' };
    };

    return <AuthContext.Provider value={{ ...authState, login, logout }}>{children}</AuthContext.Provider>;
};
