import React, { FC, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { TServerResponse } from 'types/rest/responses/serverResponse';
import { TFuncResponse } from 'types/rest';
import { TProjectCreation, TProjectEdit, TProjectJson, TProjectParticipantId } from 'types/rest/requests/project';
import { EProjectAccessRole, TProjectId } from 'types/rest/responses/project';

import { ContextError } from 'exceptions/ContextError';

import { ModalContext } from 'context/Modal.context';
import { AuthContext } from 'context/Auth.context';

import cn from 'classnames';
import { getApi } from 'utils/getApi';
import { getSavedToken } from 'utils/getSavedToken';

import { ProjectConstructorForm, TProjectFormData } from 'components/templates/ProjectConstructorForm';

import { request } from 'utils/request';
import s from './ProjectCreation.module.scss';

export const ProjectCreationForm: FC = () => {
    const navigate = useNavigate();

    const authContext = useContext(AuthContext);
    const modalContext = useContext(ModalContext);

    const requestProjectCreation = async (formData: TProjectFormData): Promise<TFuncResponse<TProjectId>> => {
        if (!authContext) throw new ContextError('No Auth context!');
        if (!authContext.userId || !authContext.isLoggedIn)
            return { message: "Can't create project - user is not authorized!", type: 'error' };

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
                { userId: authContext.userId, projectRoleId: EProjectAccessRole.PROJECT_ROLE_OWNER },
                ...newParticipantIds
            ]
        };
        const data: TProjectJson<TProjectCreation> = { project };
        return request<TProjectId>('createProject', { method: 'POST', dataRaw: data }, 'user');
    };

    const handleFormSubmit = async (formData: TProjectFormData) => {
        const { message, type, payload } = await requestProjectCreation(formData);
        modalContext?.openMessageModal(message, type);
        if (type === 'info') modalContext?.closeModal('custom');
        if (payload?.projectId) navigate({ pathname: 'projects/' + payload.projectId });
    };

    return (
        <div className={'modal'}>
            <div className={'modalContainer'}>
                <div className={'formWrapper'}>
                    <h2>Create project</h2>
                    <ProjectConstructorForm
                        handleFormSubmit={handleFormSubmit}
                        actionType={'create'}
                    />
                    <button
                        className={cn('btn', 'clickable', s.btn)}
                        onClick={() => modalContext?.closeModal('custom')}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};
