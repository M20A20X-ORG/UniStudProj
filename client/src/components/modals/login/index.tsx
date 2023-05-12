import React, { FC, MouseEvent, useContext, useRef } from 'react';
import { ContextError } from 'exceptions/ContextError';
import { TUserLogIn } from 'types/rest/requests/user';

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

        const loginData = formToObj<TUserLogIn>(formRef);
        const loginResponse = await authContext.login(loginData);
        const { type, message } = loginResponse;

        modalContext?.openMessageModal(message, type);
        if (loginResponse.type === 'info') modalContext?.closeModal('custom');
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
