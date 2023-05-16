import React, { Dispatch, FC, SetStateAction, useContext } from 'react';
import { TProject, TProjectId } from 'types/rest/responses/project';
import { TTaskCreation, TTaskJson } from 'types/rest/requests/projectTask';
import { TFuncResponse } from 'types/rest';
import { ContextError } from 'exceptions/ContextError';

import { ModalContext } from 'context/Modal.context';
import { AuthContext } from 'context/Auth.context';

import cn from 'classnames';
import { request } from 'utils/request';

import { TaskConstructorForm, TTaskFormData } from 'components/templates/TaskConstructorForm';

import s from './ProjectTaskCreate.module.scss';

interface ProjectTaskProps {
    projectData: TProject;
    editSubmittedState: [boolean, Dispatch<SetStateAction<boolean>>];
}

export const ProjectTaskCreationForm: FC<ProjectTaskProps> = (props) => {
    const { projectData, editSubmittedState} = props;

    /// ----- Context / State----- ///
    const modalContext = useContext(ModalContext);
    const authContext = useContext(AuthContext);

    const [updateToggle, toggleUpdate] =editSubmittedState
    
    /// ----- REST ----- ///
    const requestTaskCreation = async (formData: TTaskFormData): Promise<TFuncResponse<TProjectId>> => {
        if (!authContext) throw new ContextError('No Auth context!');
        if (!authContext.userId || !authContext.isLoggedIn)
            return { message: "Can't create task - user is not authorized!", type: 'error' };

        const { tags, status, assignUser, ...commonData } = formData;
        const newTagIds: number[] = tags.map(({ tagId }) => tagId);

        const data: TTaskJson<TTaskCreation> = {
            task: {
                projectId: projectData.projectId,
                ...commonData,
                newTagIds,
                assignUserId: assignUser?.userId || null,
                statusId: status?.statusId || null
            }
        };
        return request('createProjectTask', {
            method: 'POST',
            headers: { 'project-id': projectData.projectId.toString() },
            dataRaw: data
        });
    };

    /// ----- Handler ----- ///
    const handleFormSubmit = async (formData: TTaskFormData) => {
        const { message, type } = await requestTaskCreation(formData);
        modalContext?.openMessageModal(message, type);
        if (type === 'info') {
            modalContext?.closeModal('custom');
            toggleUpdate(!updateToggle)
        }
    };

    return (
        <div className={'modal'}>
            <div className={'modalContainer'}>
                <div className={'formWrapper'}>
                    <h2>Create task</h2>
                    <TaskConstructorForm
                        handleFormSubmit={handleFormSubmit}
                        actionType={'create'}
                        projectData={projectData}
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
