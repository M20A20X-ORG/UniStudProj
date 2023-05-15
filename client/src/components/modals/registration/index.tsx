import React, { FC, useContext } from 'react';
import { TServerResponse } from 'types/rest/responses/serverResponse';
import { TFuncResponse } from 'types/rest';

import { ModalContext } from 'context/Modal.context';
import { getApi } from 'utils/getApi';

import { LogInForm } from 'components/modals/Login';

import { TUserConstructorFormFilled, UserConstructorForm } from 'components/templates/userConstructorForm';
import s from './Registration.module.scss';

export const RegistrationForm: FC = () => {
    const modalContext = useContext(ModalContext);

    const requestRegistration = async (formData: any): Promise<TFuncResponse> => {
        const registrationApi = getApi('registerUser');
        const requestInit: RequestInit = {
            method: 'POST',
            headers: { 'Content-type': 'application/json;charset=utf-8' },
            body: JSON.stringify(formData)
        };

        try {
            const response = await fetch(registrationApi, requestInit);
            const json = (await response.json()) as TServerResponse;
            const message = json?.message || response.statusText;

            if (!response.ok) return { message, type: 'error' };
            return { message, type: 'info' };
        } catch (error: unknown) {
            const { message } = error as Error;
            return { message, type: 'error' };
        }
    };

    const handleFormSubmit = async (formData: TUserConstructorFormFilled) => {
        const data = { user: formData };
        const { message, type } = await requestRegistration(data);
        modalContext?.openMessageModal(message, type);
    };

    return (
        <div className={'modal'}>
            <div className={'modalContainer'}>
                <div className={'formWrapper'}>
                    <h2>Registration</h2>
                    <UserConstructorForm
                        handleFormSubmit={handleFormSubmit}
                        actionType={'register'}
                    />
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
        </div>
    );
};
