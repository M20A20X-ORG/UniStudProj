import React, { FC, ReactNode, useContext, useState } from 'react';
import { TAuthState } from 'types/context/auth.context';
import { TLogin } from 'types/rest/responses/auth';
import { TFuncResponse } from 'types/rest';
import { TUserJson, TUserLogIn } from 'types/rest/requests/user';

import { ModalContext } from 'context/Modal.context';
import { AuthContext } from 'context/Auth.context';

import { request } from 'utils/request';

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = (props) => {
    const { children } = props;
    const [authState, setAuthState] = useState<TAuthState>({ userId: null, role: null, isLoggedIn: false });

    const modalContext = useContext(ModalContext);

    /// ----- Handlers ----- ///
    const logout = (): void => setAuthState({ userId: null, role: null, isLoggedIn: false });

    const login = async (login: TUserLogIn): Promise<TFuncResponse> => {
        if (authState.isLoggedIn) {
            modalContext?.closeModal('custom');
            return { message: 'User already logged in!', type: 'error' };
        }

        const data: TUserJson<TUserLogIn> = { user: login };

        try {
            const { message, payload: authData } = await request<TLogin>(
                'login',
                { method: 'POST', dataRaw: data },
                'user/login'
            );

            const { userId, role, refreshToken, accessToken } = authData || {};
            if (!userId || !role || !refreshToken || !accessToken) return { message, type: 'error' };

            localStorage.setItem('access-token', accessToken);
            localStorage.setItem('refresh-token', refreshToken);

            setAuthState({ userId, role, isLoggedIn: true });
            return { message, type: 'info' };
        } catch (error: unknown) {
            const { message } = error as Error;
            return { message, type: 'error' };
        }
    };

    return <AuthContext.Provider value={{ ...authState, login, logout }}>{children}</AuthContext.Provider>;
};
