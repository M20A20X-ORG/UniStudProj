import React, { FC, MouseEvent, useContext, useEffect, useRef, useState } from 'react';
import { TUser } from 'types/rest/responses/auth';
import { TProject } from 'types/rest/responses/project';
import { TProjectTask, TTaskStatus } from 'types/rest/responses/projectTask';
import { TTag } from 'types/rest/responses/tag';

import { ModalContext } from 'context/Modal.context';

import { request } from 'utils/request';
import { formToObj } from 'utils/formToObj';

import { Select } from 'components/atoms/Select/Select';
import { Index } from 'components/atoms/SelectMultiple';

type TParticipantOption = Pick<TUser, 'userId' | 'username'>;
export type TTaskFormData = Omit<TProjectTask, 'projectId' | 'taskId'>;
export type TTaskFormDataRaw = Omit<TTaskFormData, 'assignUser' | 'status' | 'tags'> & {
    assignUserId: string;
    statusId: string;
    tagIds: number[];
};

const TAGS_SELECT_NAME = 'tags';
const NO_STATUS_OPTION: TTaskStatus = { statusId: 0, status: 'No status' };
const NO_ASSIGNED_OPTION: TParticipantOption = { userId: 0, username: 'Not assigned' };

interface ProjectConstructorFormProps {
    handleFormSubmit: (formData: TTaskFormData) => Promise<void>;
    actionType: 'create' | 'edit';
    initData?: TTaskFormData;
    projectData: TProject;
}

export const TaskConstructorForm: FC<ProjectConstructorFormProps> = (props) => {
    const { actionType, handleFormSubmit, initData, projectData } = props;
    const isCreationAction = actionType === 'create';

    /// ----- Context / Ref ----- ///
    const modalContext = useContext(ModalContext);
    const formRef = useRef<HTMLFormElement>(document.createElement('form'));

    /// ----- State ----- ///
    const statusesInitialState = [initData?.status ? initData.status : NO_STATUS_OPTION];

    const [statusesState, setStatusesState] = useState<TTaskStatus[]>(statusesInitialState);
    const [tagsState, setTagsState] = useState<TTag[]>([]);
    const [selectedTagsState, setSelectedTagsState] = useState<TTag[]>(initData?.tags || []);

    /// ----- REST ----- ///
    const handleStatusSelectClick = async (): Promise<void> => {
        if (statusesState.length > 1) return;
        const {
            message,
            type,
            payload: taskStatuses
        } = await request<TTaskStatus[]>(
            'getProjectTasksStatuses',
            { method: 'GET', headers: { 'project-id': projectData.projectId.toString() } },
            'project/task/status'
        );
        if (type === 'error' || !taskStatuses) return modalContext?.openMessageModal(message, type);
        setStatusesState([NO_STATUS_OPTION, ...taskStatuses]);
    };

    const fetchTags = async (): Promise<void> => {
        if (tagsState.length) return;
        const {
            message,
            type,
            payload: tags
        } = await request<TTag[]>(
            'getProjectTasksTags',
            { method: 'GET', headers: { 'project-id': projectData.projectId.toString() } },
            'tag'
        );
        if (type === 'error' || !tags) return modalContext?.openMessageModal(message, type);
        const tagsNotSelected = tags.filter((t) => !selectedTagsState.find((st) => t.tagId === st.tagId));
        setTagsState(tagsNotSelected);
    };

    /// ----- Handlers ----- ///
    const handleFormPreSubmit = async (event: MouseEvent<HTMLButtonElement>): Promise<void> => {
        event.preventDefault();

        const formDataRaw = new FormData(formRef.current);
        formDataRaw.delete(TAGS_SELECT_NAME);

        const { assignUserId, statusId, tagIds: _, ...formData } = formToObj<TTaskFormDataRaw>(formRef);
        const formDataFilled: TTaskFormData = {
            ...formData,
            assignUser: projectData.participants.find((p) => p.userId === +assignUserId) || null,
            status: statusesState.find((s) => s.statusId === +statusId) || null,
            tags: selectedTagsState
        };

        await handleFormSubmit(formDataFilled);
    };

    useEffect(() => {
        fetchTags();
    }, []);

    return (
        <>
            <form ref={formRef}>
                <fieldset className={'fieldset'}>
                    <input
                        type={'text'}
                        name={'name'}
                        placeholder={'Name:'}
                        defaultValue={initData?.name}
                        required={isCreationAction}
                    />
                    <textarea
                        name={'description'}
                        placeholder={'Description:'}
                        defaultValue={initData?.description || undefined}
                    />
                    <Select
                        name={'statusId'}
                        defaultValue={initData?.status?.statusId || NO_STATUS_OPTION.statusId}
                        onClick={handleStatusSelectClick}
                        data={{
                            options: statusesState,
                            getId: (option) => (option as TTaskStatus).statusId,
                            getText: (option) => (option as TTaskStatus).status
                        }}
                    />
                    <Select
                        name={'assignUserId'}
                        defaultValue={initData?.assignUser?.userId || NO_ASSIGNED_OPTION.userId}
                        data={{
                            options: projectData.participants,
                            getId: (option) => (option as TParticipantOption).userId,
                            getText: (option) => (option as TParticipantOption).username
                        }}
                    />
                    <Index
                        name={TAGS_SELECT_NAME}
                        defaultValue={['']}
                        state={{
                            optionsState: [tagsState, setTagsState],
                            selectedState: [selectedTagsState, setSelectedTagsState]
                        }}
                        data={{
                            getId: (option) => (option as TTag).tagId,
                            getText: (option) => (option as TTag).tag,
                            requireFilterCallback: (id) => (option) => (option as TTag).tagId !== id,
                            requireFindCallback: (id) => (option) => (option as TTag).tagId === id
                        }}
                    />
                </fieldset>
                <button
                    type={'submit'}
                    className={'btn clickable'}
                    onClick={handleFormPreSubmit}
                >
                    {isCreationAction ? 'Create' : 'Save changes'}
                </button>
            </form>
        </>
    );
};
