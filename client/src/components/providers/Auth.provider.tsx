import React, { FC, ReactNode, useState } from 'react';
import { TAuthLogin, TAuthLogout } from 'types/auth.context';
import { TUser } from 'types/user';

import { AUTH_INITIAL, AuthContext } from 'context/Auth.context';

import { validateSchema } from 'utils/validateSchema';
import { getApi } from 'utils/getApi';

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = (props) => {
    const { children } = props;

    /// ----- State ----- ///
    const [authState, setAuthState] = useState(AUTH_INITIAL);
    const setLoginPending = (isLoginPending: boolean) => setAuthState((prev) => ({ ...prev, isLoginPending }));
    const setLoginError = (loginError: string) => setAuthState((prev) => ({ ...prev, loginError }));

    /// ----- Auth ----- ///
    const logout: TAuthLogout = async () => setAuthState(AUTH_INITIAL);

    const login: TAuthLogin = async (username, password) => {
        setLoginPending(true);
        const loginApi = getApi('login');

        try {
            const response = await fetch(loginApi, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });

            if (!response.ok) setLoginError(`Error receiving from '${loginApi}': ${response.statusText}`);

            const json = await response.json();
            const user = json.user;

            const validationResult = validateSchema<TUser>(user, '/schema/user');
            if (validationResult) {
                setLoginError(`Incorrect response from '${loginApi}': ${validationResult.message}`);
                return;
            }

            setAuthState({ user, isLoginPending: false, isLoggedIn: true, loginError: '' });
        } catch (error) {
            if (error instanceof Error) setLoginError(error.message);
        }
    };

    return <AuthContext.Provider value={{ ...authState, login, logout }}>{children}</AuthContext.Provider>;
};
