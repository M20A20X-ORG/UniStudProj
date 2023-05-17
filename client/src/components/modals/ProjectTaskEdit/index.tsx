import React, { Dispatch, FC, SetStateAction, useContext } from 'react';
import { TProjectTask } from 'types/rest/responses/projectTask';
import { TProject } from 'types/rest/responses/project';
import { TTaskEdit, TTaskJson } from 'types/rest/requests/projectTask';

import { ModalContext } from 'context/Modal.context';

import cn from 'classnames';
import { diffArrays } from 'utils/diffArrays';
import { request } from 'utils/request';

import { TaskConstructorForm, TTaskFormData } from 'components/templates/TaskConstructorForm';

import s from './projectTaskEdit.module.scss';
import { trackMetrics } from 'utils/trackMetrics';

type TDiffCommon = Omit<TTaskFormData, 'assignUser' | 'status' | 'tags'>;

interface ProjectTaskProps {
    initData: TProjectTask;
    editSubmittedState: [boolean, Dispatch<SetStateAction<boolean>>];
    projectData: TProject;
}

export const ProjectTaskEditForm: FC<ProjectTaskProps> = (props) => {
    const { initData, projectData, editSubmittedState } = props;

    /// ----- Context / State----- ///
    const modalContext = useContext(ModalContext);
    const [editSubmitToggle, toggleEditSubmit] = editSubmittedState;

    /// ----- REST ----- ///
    const getDiff = (newData: TTaskFormData, initData: TProjectTask): TTaskEdit => {
        const { tags: formTags, assignUser, status, ...commonNewData } = newData;

        const commonDiffEntries: [keyof TDiffCommon, string | number | null][] = Object.keys(commonNewData)
            .filter((keyRaw) => {
                const key = keyRaw as keyof TDiffCommon;
                const initValue = initData?.[key];
                return newData[key] !== initValue;
            })
            .map((keyRaw) => {
                const key = keyRaw as keyof TDiffCommon;
                return [key, newData[key]];
            });

        const commonDiff = Object.fromEntries(commonDiffEntries) as TDiffCommon;
        const data: TTaskEdit = {
            projectId: projectData.projectId,
            taskId: initData.taskId,
            ...commonDiff
        };

        const initTagIds: number[] = initData.tags.map((tag) => tag.tagId);

        const formTagIds = formTags.map((t) => t.tagId);
        const newTagIds: number[] = diffArrays([formTagIds], [initTagIds]);
        const deleteTagIds: number[] = diffArrays([initTagIds], [formTagIds]);

        if (newTagIds.length) data.newTagIds = newTagIds;
        if (deleteTagIds.length) data.deleteTagIds = deleteTagIds;
        if (initData.status?.statusId !== status?.statusId) data.statusId = status?.statusId;
        if (initData.assignUser?.userId !== assignUser?.userId) data.assignUserId = assignUser?.userId;

        return data;
    };

    /// ----- Handler ----- ///
    const handleFormSubmit = async (formData: TTaskFormData) => {
        const data: TTaskJson<TTaskEdit> = { task: getDiff(formData, props.initData) };
        const { message, type } = await request('editProjectTask', {
            method: 'PUT',
            headers: { 'project-id': projectData.projectId.toString() },
            dataRaw: data
        });
        modalContext?.openMessageModal(message, type);
        if (type === 'info') {
            modalContext?.closeModal('custom');
            if (data.task.statusId === 3) await trackMetrics('METRICS_TASK_COMPLETION');
        }
        toggleEditSubmit(!editSubmitToggle);
    };

    const handleBtnDeleteClick = async (): Promise<void> => {
        const { message, type } = await request('deleteProjectTask', {
            method: 'DELETE',
            headers: { 'project-id': projectData.projectId.toString() },
            params: [
                ['taskId', initData.taskId],
                ['projectId', projectData.projectId]
            ]
        });
        modalContext?.openMessageModal(message, type);
        if (type === 'info') {
            modalContext?.closeModal('custom');
            toggleEditSubmit(!editSubmitToggle);
        }
    };

    return (
        <div className={'modal'}>
            <div className={'modalContainer'}>
                <div className={'formWrapper'}>
                    <h2>Edit task</h2>
                    <TaskConstructorForm
                        handleFormSubmit={handleFormSubmit}
                        actionType={'edit'}
                        initData={initData}
                        projectData={projectData}
                    />
                    <button
                        className={cn('btn', 'clickable', s.btn)}
                        onClick={handleBtnDeleteClick}
                    >
                        Delete
                    </button>
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
