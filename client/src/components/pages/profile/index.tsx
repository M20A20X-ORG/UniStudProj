import React, { FC, JSX, useContext, useEffect, useState } from 'react';
import { ACCESS_ROLE, TUser } from 'types/rest/responses/auth';
import { TServerResponse } from 'types/rest/responses/serverResponse';
import { TFuncResponse } from 'types/rest';
import { TUserEdit, TUserJson } from 'types/rest/requests/user';

import { ContextError } from 'exceptions/ContextError';

import { ModalContext } from 'context/Modal.context';
import { AuthContext } from 'context/Auth.context';

import cn from 'classnames';
import { getApi } from 'utils/getApi';
import { fetchUrl } from 'utils/fetchUrl';
import { getSavedToken } from 'utils/getSavedToken';

import { TUserConstructorFormFilled, UserConstructorForm } from 'components/templates/userConstructorForm';

import imgProfileFallback from 'assets/images/profile/profile-image-fallback.jpg';
import s from './profile.module.scss';

export const ProfilePage: FC = () => {
    /// --- Context --- ///
    const modalContext = useContext(ModalContext);
    const authContext = useContext(AuthContext);

    /// --- State --- ///
    const [userState, setUserState] = useState<TUser | null>(null);
    const [editState, setEditState] = useState<boolean>(false);

    /// ----- Handlers ----- ///
    /// --- Edit User --- ///
    const requestUploadFile = async (file: File): Promise<TFuncResponse<string>> => {
        const fileFormData: any = new FormData();
        fileFormData.append('event', 'file');
        fileFormData.append('file', file);

        const apiCreateResource = getApi('uploadResource');
        const requestInit: RequestInit = {
            method: 'POST',
            headers: {
                authorization: getSavedToken('access-token')
            },
            body: fileFormData
        };

        try {
            const response = await fetch(apiCreateResource, requestInit);
            const json = (await response.json()) as TServerResponse<string[]>;

            const message = json?.message || response.statusText;
            const { payload } = json || {};
            const [url] = payload || [];

            if (!response.ok) return { message, type: 'error' };
            if (typeof url !== 'string')
                return { message: `Incorrect response from server: ${message}`, type: 'error' };

            return { message, type: 'info', payload: url };
        } catch (error: unknown) {
            const { message } = error as Error;
            return { message, type: 'error' };
        }
    };

    const updateUserInfo = async (formData: any): Promise<TFuncResponse<string>> => {
        const apiEdit = getApi('editUser');
        const requestInit: RequestInit = {
            method: 'PUT',
            headers: {
                'Content-type': 'application/json;charset=utf-8',
                authorization: getSavedToken('access-token')
            },
            body: JSON.stringify(formData)
        };

        try {
            const response = await fetch(apiEdit, requestInit);
            if (response.status === 500) return { message: response.statusText, type: 'error' };
            const json = (await response.json()) as TServerResponse;

            const message = json?.message || response.statusText;
            if (!response.ok) return { message, type: 'error' };

            return { message, type: 'info' };
        } catch (error: unknown) {
            const { message } = error as Error;
            return { message, type: 'error' };
        }
    };

    const handleUserEditSubmit = async (formData: TUserConstructorFormFilled): Promise<void> => {
        if (!authContext) throw new ContextError('No Auth Context!');

        const { userId } = authContext;
        if (!userId) return modalContext?.openMessageModal("Can't edit unauthorized user!", 'error');

        const formDataFiltered = Object.fromEntries(
            Object.keys(formData)
                .filter((key) => formData[key as keyof TUserConstructorFormFilled])
                .map((key) => [key, formData[key as keyof TUserConstructorFormFilled]])
        );

        let imgUrl = '';
        if (formData.imgUrl.name) {
            const { message, type, payload: url } = await requestUploadFile(formData.imgUrl);
            if (type === 'error' || !url) return modalContext?.openMessageModal(message, type);
            imgUrl = url;
        }

        const data: TUserJson<TUserEdit> = { user: { userId, ...formDataFiltered, imgUrl } };
        const { message, type } = await updateUserInfo(data);
        modalContext?.openMessageModal(message, type);

        if (type === 'info') setEditState(false);
    };

    /// --- Render --- ///
    const btnEditElem = (
        <div
            className={s.edit}
            onClick={() => setEditState(true)}
        >
            <span className={'clickable'}>Edit</span>
        </div>
    );

    const renderFormEdit = (user: TUser | null): JSX.Element => {
        if (!user) return <></>;
        const { userId: _, role: __, ...initData } = user;
        return (
            <>
                <UserConstructorForm
                    handleFormSubmit={handleUserEditSubmit}
                    actionType={'edit'}
                    initData={initData}
                />
                <button
                    className={cn('btn', 'clickable', s.btnCancelEdit)}
                    onClick={() => setEditState(false)}
                >
                    Cancel
                </button>
            </>
        );
    };

    const renderProfile = (user: TUser | null) => {
        const { userId, role, email, group, name, imgUrl, username, about } = user || {};
        const infoElem = (
            <>
                <div className={cn('cardHead', s.profileCardHead)}>
                    <span>Role: {role ? ACCESS_ROLE[role as keyof typeof ACCESS_ROLE] : '--'}</span>
                    <span>User ID: {userId ?? '--'}</span>
                </div>
                <div className={s.profileCardCommon}>
                    <div>
                        <img
                            className={s.image}
                            src={imgUrl || imgProfileFallback}
                            alt={'profile image'}
                        />
                    </div>
                    <ul className={'cardCommon'}>
                        <span className={'cardKey'}>Name:</span>
                        <span>{name ?? '--'}</span>
                        <span className={'cardKey'}>Group:</span>
                        <span>{group ?? '--'}</span>
                        <span className={'cardKey'}>Email:</span>
                        <span>{email ?? '--'}</span>
                        <span className={'cardKey'}>Username:</span>
                        <span>{username ?? '--'}</span>
                    </ul>
                </div>
                <div className={s.infoAbout}>
                    <span className={s.infoAboutKey}>About:</span>
                    <span className={s.infoAboutValue}>{about || '--'}</span>
                </div>
                {!userState || editState ? null : btnEditElem}
            </>
        );

        return <>{editState ? renderFormEdit(userState) : infoElem}</>;
    };

    const updateUserState = async () => {
        if (!authContext) throw new ContextError('No Auth Context!');

        const { userId } = authContext;
        if (!userId) return setUserState(null);

        const { type, message, payload } = await fetchUrl<TUser>('getUsers', 'userIdentifiers', [userId], 'user');
        const [user] = payload || [];
        if (type === 'error' || !user) {
            modalContext?.openMessageModal(message, type);
            return setUserState(null);
        }

        setUserState(user);
    };

    /// ----- ComponentDidUpdate ------ ///
    useEffect(() => {
        updateUserState();
    }, [authContext?.isLoggedIn, editState]);

    return <section>{renderProfile(userState)}</section>;
};
