import React, { FC, useRef } from 'react';

import { TUserRegistration } from 'types/rest/requests/user';

import { formToObj } from 'utils/formToObj';

import s from './UserConstructor.module.scss';

export type TUserConstructorForm = Omit<TUserRegistration, 'imgUrl'> & { imgFile: File };
export type TUserConstructorFormInit = Omit<TUserConstructorForm, 'imgFile' | 'password' | 'passwordConfirm'>;

interface UserConstructorFormProps {
    handleFormSubmit: (formData: TUserConstructorForm) => Promise<void>;
    actionType: 'register' | 'edit';
    initData?: TUserConstructorFormInit;
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
                        defaultValue={initData?.name}
                        required={isFieldsRequired}
                    />
                    <input
                        type={'text'}
                        name={'email'}
                        placeholder={'Email:'}
                        defaultValue={initData?.email}
                        required={isFieldsRequired}
                    />
                    <input
                        type={'file'}
                        name={'imgFile'}
                    />
                    <input
                        type={'text'}
                        name={'username'}
                        placeholder={'Username:'}
                        defaultValue={initData?.username}
                        required={isFieldsRequired}
                    />
                    <input
                        type={'text'}
                        name={'group'}
                        placeholder={'Group:'}
                        defaultValue={initData?.group}
                        required={isFieldsRequired}
                    />
                    <textarea
                        name={'about'}
                        placeholder={'About:'}
                        defaultValue={initData?.about}
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
                        const formData = formToObj<TUserConstructorForm>(formRef);
                        await handleFormSubmit(formData);
                    }}
                >
                    {actionType === 'register' ? 'Register' : 'Save changes'}
                </button>
            </form>
        </>
    );
};
