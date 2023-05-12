import React, { FC, useContext, useEffect, useState } from 'react';
import { TUser } from 'types/rest/responses/auth';
import { TServerResponse } from 'types/rest/responses/serverResponse';
import { TFuncResponse } from 'types/rest';
import { TUserEdit, TUserJson } from 'types/rest/requests/user';

import { ContextError } from 'exceptions/ContextError';

import { ModalContext } from 'context/Modal.context';
import { AuthContext } from 'context/Auth.context';

import cn from 'classnames';

import { getApi } from 'utils/getApi';
import { fetchUsers } from 'utils/fetchUsers';

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
    const uploadFile = async (file: File): Promise<TFuncResponse<string>> => {
        const fileFormData: any = new FormData();
        fileFormData.append('event', 'file');
        fileFormData.append('file', file);

        const apiCreateResource = getApi('uploadResource');
        const requestInit: RequestInit = {
            method: 'POST',
            headers: {
                authorization: 'Bearer ' + localStorage.getItem('access-token')
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
                authorization: 'Bearer ' + localStorage.getItem('access-token')
            },
            body: JSON.stringify(formData)
        };

        try {
            const response = await fetch(apiEdit, requestInit);
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
        if (!modalContext) throw new ContextError('No Modal Context!');
        if (!authContext) throw new ContextError('No Auth Context!');

        const { userId } = authContext;
        if (!userId) return modalContext.openMessageModal("Can't edit unauthorized user!", 'error');

        const fileUploadResponse = await uploadFile(formData.imgUrl);
        if (fileUploadResponse.type === 'error')
            return modalContext.openMessageModal(fileUploadResponse.message, fileUploadResponse.type);

        const editFormData = { ...formData, imgUrl: fileUploadResponse.payload };
        const data: TUserJson<TUserEdit> = { user: { userId, ...editFormData } };

        const { message, type } = await updateUserInfo(data);
        modalContext.openMessageModal(message, type);

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

    const renderFormEdit = () => {
        let initData = undefined;
        if (userState) {
            const { userId: _, role: __, ...rest } = userState;
            initData = rest;
        }
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

    const renderUserState = () => {
        const { email, group, name, imgUrl, username, about } = userState || {};

        const infoElem = (
            <>
                <div className={s.head}>
                    <div>
                        <img
                            className={s.image}
                            src={imgUrl || imgProfileFallback}
                            alt={'profile image'}
                        />
                    </div>
                    <ul className={s.info}>
                        <span className={s.infoKey}>Name:</span>
                        <span>{name ?? '--'}</span>
                        <span className={s.infoKey}>Group:</span>
                        <span>{group ?? '--'}</span>
                        <span className={s.infoKey}>Email:</span>
                        <span>{email ?? '--'}</span>
                        <span className={s.infoKey}>Username:</span>
                        <span>{username ?? '--'}</span>
                    </ul>
                </div>
                <div className={s.infoAbout}>
                    <span className={s.infoAboutKey}>About:</span>
                    <span>{about ?? '--'}</span>
                </div>
                {!userState || editState ? null : btnEditElem}
            </>
        );

        return <>{editState ? renderFormEdit() : infoElem}</>;
    };

    /// ----- ComponentDidUpdate ------ ///
    const handleComponentDidUpdate = async () => {
        if (!modalContext) throw new ContextError('No Modal Context!');
        if (!authContext) throw new ContextError('No Auth Context!');

        const { userId } = authContext;
        if (!userId) return setUserState(null);

        const { type, message, payload } = await fetchUsers([userId]);
        const [user] = payload || [];
        if (type === 'error' || !user) {
            modalContext.openMessageModal(message, type);
            return setUserState(null);
        }

        setUserState(user);
    };

    useEffect(() => {
        handleComponentDidUpdate();
    }, [authContext?.isLoggedIn]);

    return <section>{renderUserState()}</section>;
};
