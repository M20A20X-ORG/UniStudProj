import React, { FC, JSX, useContext, useEffect, useState } from 'react';
import { ACCESS_ROLE, TUser } from 'types/rest/responses/auth';
import { TUserEdit, TUserJson } from 'types/rest/requests/user';

import { ContextError } from 'exceptions/ContextError';

import { ModalContext } from 'context/Modal.context';
import { AuthContext } from 'context/Auth.context';

import cn from 'classnames';
import { request } from 'utils/request';
import { requestFileUpload } from 'utils/requestFileUpload';

import { TUserConstructorForm, UserConstructorForm } from 'components/templates/UserConstructorForm';

import imgProfileFallback from 'assets/images/profile/profile-image-fallback.jpg';
import s from './Profile.module.scss';

export const ProfilePage: FC = () => {
    /// --- Context --- ///
    const modalContext = useContext(ModalContext);
    const authContext = useContext(AuthContext);

    /// --- State --- ///
    const [userState, setUserState] = useState<TUser | null>(null);
    const [editState, setEditState] = useState<boolean>(false);

    /// --- REST --- ///
    const fetchUser = async () => {
        if (!authContext) throw new ContextError('No Auth Context!');

        const { userId } = authContext;
        if (!userId) return setUserState(null);

        const { type, message, payload } = await request<TUser[]>(
            'getUsers',
            { method: 'GET', params: [['userIdentifiers[]', userId]] },
            'user'
        );
        const [user] = payload || [];
        if (type === 'error' || !user) {
            modalContext?.openMessageModal(message, type);
            return setUserState(null);
        }

        setUserState(user);
    };

    const deleteUser = async () => {
        if (!authContext) throw new ContextError('No Auth context!');

        const { userId } = authContext;
        if (!userId) return setUserState(null);

        const { type, message } = await request('deleteUser', {
            method: 'DELETE',
            params: [['userId', userId]]
        });
        modalContext?.openMessageModal(message, type);
        authContext.logout();
    };

    /// ----- Handlers ----- ///
    /// --- Edit User --- ///
    const handleUserEditSubmit = async (formData: TUserConstructorForm): Promise<void> => {
        if (!authContext) throw new ContextError('No Auth Context!');

        const { userId } = authContext;
        if (!userId) return modalContext?.openMessageModal("Can't edit unauthorized user!", 'error');

        const { imgFile, ...dataNoImg } = formData;
        const formDataFiltered = Object.fromEntries(
            Object.keys(dataNoImg)
                .filter((key) => formData[key as keyof TUserConstructorForm])
                .map((key) => [key, formData[key as keyof TUserConstructorForm]])
        );

        let imgUrl = '';
        if (imgFile.name) {
            const { message, type, payload: url } = await requestFileUpload(imgFile);
            if (type === 'error' || !url) return modalContext?.openMessageModal(message, type);
            imgUrl = url;
        }

        const data: TUserJson<TUserEdit> = { user: { userId, ...formDataFiltered, imgUrl } };
        const { message, type } = await request('editUser', {
            method: 'PUT',
            dataRaw: data
        });

        if (type === 'error') return modalContext?.openMessageModal(message, type);
        modalContext?.openMessageModal(message, type);

        if (type === 'info') setEditState(false);
    };

    /// --- Render --- ///
    const btnEditElem = (
        <div className={s.edit}>
            <span
                className={'clickable'}
                onClick={() => setEditState(true)}
            >
                Edit
            </span>
        </div>
    );

    const renderFormEdit = (user: TUser | null): JSX.Element => {
        if (!user) return <></>;
        const { userId: _, role: __, imgUrl: ___, ...initData } = user;
        return (
            <>
                <UserConstructorForm
                    handleFormSubmit={handleUserEditSubmit}
                    actionType={'edit'}
                    initData={initData}
                />
                <button
                    className={cn('btn', 'clickable', s.btn)}
                    onClick={async () => {
                        await deleteUser();
                        setEditState(false);
                    }}
                >
                    Delete
                </button>
                <button
                    className={cn('btn', 'clickable', s.btn)}
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
                        <span
                            className={'cardKey'}
                            role={'name'}
                        >
                            Name:
                        </span>
                        <span>{name ?? '--'}</span>
                        <span
                            className={'cardKey'}
                            role={'group'}
                        >
                            Group:
                        </span>
                        <span>{group ?? '--'}</span>
                        <span
                            className={'cardKey'}
                            role={'email'}
                        >
                            Email:
                        </span>
                        <span>{email ?? '--'}</span>
                        <span
                            className={'cardKey'}
                            role={'username'}
                        >
                            Username:
                        </span>
                        <span>{username ?? '--'}</span>
                    </ul>
                </div>
                <div className={s.infoAbout}>
                    <span
                        className={s.infoAboutKey}
                        role={'about'}
                    >
                        About:
                    </span>
                    <span className={s.infoAboutValue}>{about || '--'}</span>
                </div>
                {!userState || editState ? null : btnEditElem}
            </>
        );

        return <>{editState ? renderFormEdit(userState) : infoElem}</>;
    };

    /// ----- ComponentDidUpdate ------ ///
    useEffect(() => {
        fetchUser();
    }, [authContext?.isLoggedIn, editState]);

    return <section>{renderProfile(userState)}</section>;
};
