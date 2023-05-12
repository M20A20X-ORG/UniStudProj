import React, { FC, useRef } from 'react';

import { TUserRegistration } from 'types/rest/requests/user';

import { formToObj } from 'utils/formToObj';
import s from './userConstructor.module.scss';

type TConstructorForm = Omit<TUserRegistration, 'passwordConfirm' | 'password'>;
export type TUserConstructorFormFilled = Omit<TConstructorForm, 'imgUrl'> & { imgUrl: File };

interface UserConstructorFormProps {
    handleFormSubmit: (formData: TUserConstructorFormFilled) => Promise<void>;
    actionType: 'register' | 'edit';
    initData?: TConstructorForm;
}

export const UserConstructorForm: FC<UserConstructorFormProps> = (props) => {
    const { actionType, handleFormSubmit, initData } = props;

    const isFieldsRequired = actionType === 'register';

    const formRef = useRef<HTMLFormElement>(document.createElement('form'));

    return (
        <>
            <form
                ref={formRef}
                className={s.form}
            >
                <fieldset className={'fieldset'}>
                    <input
                        type={'text'}
                        name={'name'}
                        placeholder={'Name:'}
                        value={initData?.name}
                        required={isFieldsRequired}
                    />
                    <input
                        type={'text'}
                        name={'email'}
                        placeholder={'Email:'}
                        value={initData?.email}
                        required={isFieldsRequired}
                    />
                    <input
                        type={'file'}
                        name={'imgUrl'}
                        required={isFieldsRequired}
                    />
                    <input
                        type={'text'}
                        name={'username'}
                        placeholder={'Username:'}
                        value={initData?.username}
                        required={isFieldsRequired}
                    />
                    <input
                        type={'text'}
                        name={'group'}
                        placeholder={'Group:'}
                        value={initData?.group}
                        required={isFieldsRequired}
                    />
                    <textarea
                        name={'about'}
                        placeholder={'About:'}
                        value={initData?.about}
                        required={isFieldsRequired}
                    />
                    <div className={s.passwords}>
                        <input
                            type={'password'}
                            name={'password'}
                            placeholder={'Password:'}
                            required={isFieldsRequired}
                        />
                        <input
                            type={'password'}
                            name={'passwordConfirm'}
                            placeholder={'Password Confirm:'}
                            required={isFieldsRequired}
                        />
                    </div>
                </fieldset>
                <button
                    type={'submit'}
                    className={'btn clickable'}
                    onClick={async (event) => {
                        event.preventDefault();
                        const formData = formToObj<TUserConstructorFormFilled>(formRef);
                        await handleFormSubmit(formData);
                    }}
                >
                    {actionType === 'register' ? 'Register' : 'Save changes'}
                </button>
            </form>
        </>
    );
};
