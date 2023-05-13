import React, { FC, useContext } from 'react';
import { TServerResponse } from 'types/rest/responses/serverResponse';
import { TFuncResponse } from 'types/rest';
import { TProjectCreation, TProjectJson, TProjectParticipantId } from 'types/rest/requests/project';
import { EProjectRole } from 'types/rest/responses/project';

import { ContextError } from 'exceptions/ContextError';

import { ModalContext } from 'context/Modal.context';
import { AuthContext } from 'context/Auth.context';

import cn from 'classnames';
import { getApi } from 'utils/getApi';
import { getSavedToken } from 'utils/getSavedToken';

import { ProjectConstructorForm, TProjectFormData } from 'components/templates/projectConstructorForm';

import s from './projectCreation.module.scss';

export const ProjectCreationForm: FC = () => {
    const authContext = useContext(AuthContext);
    const modalContext = useContext(ModalContext);

    const requestCreation = async (formData: TProjectFormData): Promise<TFuncResponse> => {
        if (!authContext) throw new ContextError('No Auth context!');
        if (!authContext.userId || !authContext.isLoggedIn)
            return { message: "Can't create project - user is not authorized!", type: 'error' };

        const registrationApi = getApi('createProject');

        const { tags, participants, ...commonData } = formData;
        const newTagIds: number[] = tags.map(({ tagId }) => tagId);
        const newParticipantIds: TProjectParticipantId[] = participants.map(({ userId, projectRoleId }) => ({
            userId,
            projectRoleId
        }));
        const project: TProjectCreation = {
            ...commonData,
            newTagIds,
            newParticipantIds: [
                { userId: authContext.userId, projectRoleId: EProjectRole.PROJECT_ROLE_OWNER },
                ...newParticipantIds
            ]
        };
        const data: TProjectJson<TProjectCreation> = { project };

        const requestInit: RequestInit = {
            method: 'POST',
            headers: {
                'Content-type': 'application/json;charset=utf-8',
                authorization: getSavedToken('access-token')
            },
            body: JSON.stringify(data)
        };

        try {
            const response = await fetch(registrationApi, requestInit);
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

    const handleFormSubmit = async (formData: TProjectFormData) => {
        const { message, type } = await requestCreation(formData);
        modalContext?.openMessageModal(message, type);
    };

    return (
        <div className={'modal'}>
            <div className={'formWrapper'}>
                <h2>Create project</h2>
                <ProjectConstructorForm
                    handleFormSubmit={handleFormSubmit}
                    actionType={'create'}
                />
                <button
                    className={cn('btn', 'clickable', s.btnCancel)}
                    onClick={() => modalContext?.closeModal('custom')}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};
