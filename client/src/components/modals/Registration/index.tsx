import React, { FC, useContext } from 'react';
import { TUserEdit, TUserJson, TUserRegistration } from 'types/rest/requests/user';

import { ContextError } from 'exceptions/ContextError';

import { ModalContext } from 'context/Modal.context';
import { AuthContext } from 'context/Auth.context';

import { request } from 'utils/request';
import { requestFileUpload } from 'utils/requestFileUpload';

import { LogInForm } from 'components/modals/Login';
import { TUserConstructorForm, UserConstructorForm } from 'components/templates/UserConstructorForm';

import s from './Registration.module.scss';

export const RegistrationForm: FC = () => {
    const modalContext = useContext(ModalContext);
    const authContext = useContext(AuthContext);

    const handleFormSubmit = async (formData: TUserConstructorForm): Promise<void> => {
        const { imgFile, ...formDataCommon } = formData;

        const data: TUserJson<TUserRegistration> = { user: { ...formDataCommon, imgUrl: null } };
        const { message, type } = await request('registerUser', { method: 'POST', dataRaw: data });
        modalContext?.openMessageModal(message, type);
        if (type === 'error') return;

        if (!authContext) throw new ContextError('No Auth Context!');
        const { username, password } = data.user;
        const loginResponse = await authContext.login({ username, password });
        if (loginResponse.type === 'error') return modalContext?.openMessageModal(message, type);
        modalContext?.closeModal('custom');
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
