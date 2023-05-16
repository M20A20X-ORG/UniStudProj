import React, { Dispatch, FC, SetStateAction, useContext } from 'react';
import { TServerResponse } from 'types/rest/responses/serverResponse';
import { TFuncResponse } from 'types/rest';
import { TProject } from 'types/rest/responses/project';
import { TProjectEdit, TProjectJson, TProjectParticipantId } from 'types/rest/requests/project';

import { ModalContext } from 'context/Modal.context';

import cn from 'classnames';
import { getApi } from 'utils/getApi';
import { getSavedToken } from 'utils/getSavedToken';

import { ProjectConstructorForm, TProjectFormData } from 'components/templates/ProjectConstructorForm';

import s from './ProjectEdit.module.scss';

type TDiffCommon = Omit<Partial<TProjectFormData>, 'tags' | 'participants'>;

interface ProjectEditProps {
    initData: TProject;
    editSubmittedState: [boolean, Dispatch<SetStateAction<boolean>>];
}

export const ProjectEditForm: FC<ProjectEditProps> = (props) => {
    /// ----- Props ----- ///
    const { projectId, tagsAmount: _, participantsAmount: __, ...initData } = props.initData;

    /// ----- State / Context----- ///
    const [editSubmitToggle, toggleEditSubmit] = props.editSubmittedState;
    const modalContext = useContext(ModalContext);

    /// ----- REST ----- ///
    const getDiff = (newData: TProjectFormData, initData: TProject): TProjectEdit => {
        const { tags: newTags, participants: newParticipants, ...commonNewData } = newData;

        const commonDiffEntries: [keyof TDiffCommon, string | null][] = Object.keys(commonNewData)
            .filter((keyRaw) => {
                const key = keyRaw as keyof TDiffCommon;
                const initValue = initData?.[key];
                return newData[key] !== initValue;
            })
            .map((keyRaw) => {
                const key = keyRaw as keyof TDiffCommon;
                return [key, newData[key]];
            });

        const data: TProjectEdit = { projectId, ...(Object.fromEntries(commonDiffEntries) as TDiffCommon) };

        const { tags: initTags } = initData;
        const { participants: initParticipants } = initData;

        const newTagIds: number[] = newTags.filter((tag) => !initTags.includes(tag)).map((tag) => tag.tagId);
        const deleteTagIds: number[] = initTags.filter((tag) => !newTags.includes(tag)).map((tag) => tag.tagId);
        const newParticipantIds: TProjectParticipantId[] = newParticipants
            .filter(
                (np) =>
                    !initParticipants.find((p) => p.userId === np.userId) ||
                    initParticipants.find((p) => p.userId === np.userId && p.projectRoleId !== np.projectRoleId)
            )
            .map(({ userId, projectRoleId }) => ({ userId, projectRoleId }));
        const deleteParticipantIds: number[] = initParticipants
            .filter(
                (p) =>
                    !newParticipants.find((np) => np.userId === p.userId) ||
                    newParticipants.find((np) => np.userId === p.userId && np.projectRoleId !== p.projectRoleId)
            )
            .map((p) => p.userId);

        if (newTagIds.length) data.newTagIds = newTagIds;
        if (deleteTagIds.length) data.deleteTagIds = deleteTagIds;
        if (newParticipantIds.length) data.newParticipantIds = newParticipantIds;
        if (deleteParticipantIds.length) data.deleteParticipantIds = deleteParticipantIds;

        return data;
    };

    const requestEdit = async (formData: TProjectFormData): Promise<TFuncResponse> => {
        const registrationApi = getApi('editProject');
        const data: TProjectJson<TProjectEdit> = { project: getDiff(formData, props.initData) };

        const requestInit: RequestInit = {
            method: 'PUT',
            headers: {
                'Content-type': 'application/json;charset=utf-8',
                authorization: getSavedToken('access-token'),
                'project-id': projectId.toString()
            },
            body: JSON.stringify(data)
        };

        try {
            const response = await fetch(registrationApi, requestInit);
            if (response.status === 500) return { message: response.statusText, type: 'error' };
            const json = (await response.json()) as TServerResponse<TProject>;

            const message = json?.message || response.statusText;
            if (!response.ok) return { message, type: 'error' };

            return { message, type: 'info' };
        } catch (error: unknown) {
            const { message } = error as Error;
            return { message, type: 'error' };
        }
    };

    /// ----- Handler ----- ///
    const handleFormSubmit = async (formData: TProjectFormData) => {
        const { message, type } = await requestEdit(formData);
        modalContext?.openMessageModal(message, type);
        toggleEditSubmit(!editSubmitToggle);
    };

    return (
        <div className={'modal'}>
            <div className={'modalContainer'}>
                <div className={'formWrapper'}>
                    <h2>Edit project</h2>
                    <ProjectConstructorForm
                        handleFormSubmit={handleFormSubmit}
                        actionType={'edit'}
                        initData={initData}
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
