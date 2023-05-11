import React, { FC, MouseEvent, useContext, useRef } from 'react';
import { TUserLogIn } from 'types/requests/login';
import { ContextError } from 'exceptions/ContextError';
import { TModalMessage } from 'types/context/modal.context';

import { ModalContext } from 'context/Modal.context';
import { AuthContext } from 'context/Auth.context';

import { formToObj } from 'utils/formToObj';

import { RegistrationForm } from 'components/modals/registration';

import s from './login.module.scss';

export const LogInForm: FC = () => {
    const modalContext = useContext(ModalContext);
    const authContext = useContext(AuthContext);

    const formRef = useRef<HTMLFormElement>(document.createElement('form'));

    const handleFormSubmit = async (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (!authContext) throw new ContextError('No Auth Context!');
        if (!modalContext) throw new ContextError('No Modal Context!');

        const login = formToObj<TUserLogIn>(formRef);
        const loginResponse: TModalMessage = await authContext.login(login);

        modalContext.openMessageModal(loginResponse);
        if (loginResponse.type === 'info') modalContext.closeModal('custom');
    };

    return (
        <div className={'modal'}>
            <div className={'formWrapper'}>
                <h2>Log In</h2>
                <form
                    ref={formRef}
                    className={s.loginForm}
                >
                    <fieldset className={'fieldset'}>
                        <input
                            type={'text'}
                            name={'username'}
                            placeholder={'Username:'}
                        />
                        <input
                            type={'password'}
                            name={'password'}
                            placeholder={'Password:'}
                        />
                    </fieldset>
                    <button
                        type={'submit'}
                        className={'btn clickable'}
                        onClick={(event) => handleFormSubmit(event)}
                    >
                        Log In
                    </button>
                </form>
                <div className={s.register}>
                    <span
                        className={'clickable'}
                        onClick={() => modalContext?.openModal(<RegistrationForm />, 'custom')}
                    >
                        Don&apos;t have account? Register now!
                    </span>
                </div>
            </div>
        </div>
    );
};
