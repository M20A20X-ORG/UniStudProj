import React, { FC, MouseEvent, useContext, useRef } from 'react';
import { TModalMessage } from 'types/context/modal.context';
import { TPayloadResponse } from 'types/schemas/serverResponse';
import { TUser, TUserJson } from 'types/schemas/auth';
import { TUserRegistration } from 'types/requests/login';

import { ContextError } from 'exceptions/ContextError';

import { ModalContext } from 'context/Modal.context';

import { formToObj } from 'utils/formToObj';
import { getApi } from 'utils/getApi';

import { LogInForm } from 'components/modals/login';

import s from './registration.module.scss';

export const RegistrationForm: FC = () => {
    const modalContext = useContext(ModalContext);

    const formRef = useRef<HTMLFormElement>(document.createElement('form'));

    const requestRegistration = async (): Promise<TModalMessage> => {
        if (!modalContext) throw new ContextError('No Modal Context!');

        const registerApi = getApi('register');
        const data: TUserJson<TUserRegistration> = { user: formToObj(formRef) };
        const requestInit: RequestInit = {
            method: 'POST',
            headers: { 'Content-type': 'application/json;charset=utf-8' },
            body: JSON.stringify(data)
        };

        let message = null;

        try {
            const response = await fetch(registerApi, requestInit);
            const text = await response.text();
            if (!text) return { message: 'Empty response from server', type: 'error' };

            const json = JSON.parse(text) as TPayloadResponse<TUser>;
            message = json.message;
            if (!response.ok) return { message, type: 'error' };
        } catch (error: unknown) {
            if (error instanceof Error) return { message: error.message, type: 'error' };
        }

        return { message: message as string, type: 'info' };
    };

    const handleFormSubmit = async (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (!modalContext) throw new ContextError('No Modal Context!');

        const loginResponse: TModalMessage = await requestRegistration();
        modalContext?.openMessageModal(loginResponse);
    };

    return (
        <div className={'modal'}>
            <div className={'formWrapper'}>
                <h2>Registration</h2>
                <form ref={formRef} className={s.registrationForm}>
                    <fieldset className={'fieldset'}>
                        <input
                            type={'text'}
                            name={'name'}
                            placeholder={'Name:'}
                        />
                        <input
                            type={'text'}
                            name={'email'}
                            placeholder={'Email:'}
                        />
                        <input
                            type={'text'}
                            name={'username'}
                            placeholder={'Username:'}
                        />
                        <input
                            type={'text'}
                            name={'group'}
                            placeholder={'Group:'}
                        />
                        <textarea
                            name={'about'}
                            placeholder={'About:'}
                        />
                        <div className={s.passwords}>
                            <input
                                type={'password'}
                                name={'password'}
                                placeholder={'Password:'}
                            />
                            <input
                                type={'password'}
                                name={'passwordConfirm'}
                                placeholder={'Password Confirm:'}
                            />
                        </div>
                    </fieldset>
                    <button
                        type={'submit'}
                        className={'btn clickable'}
                        onClick={(event) => handleFormSubmit(event)}
                    >
                        Register
                    </button>
                </form>
                <div className={s.login}>
                    <span
                        className={'clickable'}
                        onClick={() => modalContext?.openModal(<LogInForm />, 'custom')}
                    >
                        Already registered? Log In!
                    </span>
                </div>
            </div>
        </div>
    );
};
