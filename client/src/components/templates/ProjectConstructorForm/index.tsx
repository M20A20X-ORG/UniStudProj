import React, { ChangeEvent, FC, FormEvent, MouseEvent, useContext, useEffect, useRef, useState } from 'react';
import { EProjectAccessRole, PROJECT_ACCESS_ROLE, TProject, TProjectParticipant } from 'types/rest/responses/project';
import { TUser } from 'types/rest/responses/auth';
import { TTag } from 'types/rest/responses/tag';

import { OPTIONS_LIMIT } from 'assets/static/common';

import { ModalContext } from 'context/Modal.context';
import { AuthContext } from 'context/Auth.context';
import { formToObj } from 'utils/formToObj';
import { request } from 'utils/request';

import { SelectMultiple } from 'components/atoms/SelectMultiple';

import { TGetPropCallback } from 'utils/diffArrays';
import { Select } from 'components/atoms/Select';
import s from './ProjectConstructor.module.scss';

type TProjectRole = Pick<TProjectParticipant, 'projectRoleId' | 'projectRole'>;
type TFormInitialData = Omit<TProject, 'projectId' | 'participantsAmount' | 'tagsAmount'>;
export type TProjectFormData = Required<TFormInitialData>;
export type TProjectFormCommonData = Omit<TProjectFormData, 'tags' | 'participants'>;

const TAGS_SELECT_NAME = 'tags';
const PARTICIPANTS_SELECT_NAME = 'participants';

const PROJECT_ROLES: TProjectRole[] = Object.entries(PROJECT_ACCESS_ROLE).map(([key, value]) => ({
    projectRoleId: +key,
    projectRole: value
}));

const getTagId: TGetPropCallback<TTag, number> = (tag) => tag.tagId;
const getParticipantId: TGetPropCallback<TProjectParticipant, number> = (user) => user.userId;

interface ProjectConstructorFormProps {
    handleFormSubmit: (formData: TProjectFormData) => Promise<void>;
    actionType: 'create' | 'edit';
    initData?: TFormInitialData;
}

export const ProjectConstructorForm: FC<ProjectConstructorFormProps> = (props) => {
    const { actionType, handleFormSubmit, initData } = props;
    const isCreationAction = actionType === 'create';

    /// ----- Context / Ref ----- ///
    const modalContext = useContext(ModalContext);
    const authContext = useContext(AuthContext);
    const formRef = useRef<HTMLFormElement>(document.createElement('form'));

    /// ----- State ----- ///
    const [tagsState, setTagsState] = useState<TTag[]>([]);
    const [selectedTagsState, setSelectedTagsState] = useState<TTag[]>(initData?.tags || []);
    const [usersState, setUsersState] = useState<TProjectParticipant[]>([]);
    const [selectedUsersState, setSelectedUsersState] = useState<TProjectParticipant[]>(initData?.participants || []);

    /// ----- Handlers ----- ///
    const handleFormPreSubmit = async (event: MouseEvent<HTMLButtonElement>): Promise<void> => {
        event.preventDefault();

        const formDataRaw = new FormData(formRef.current);
        formDataRaw.delete(TAGS_SELECT_NAME);
        formDataRaw.delete(PARTICIPANTS_SELECT_NAME);

        const formData = formToObj<TProjectFormCommonData>(formRef);
        const formDataFilled: TProjectFormData = {
            ...formData,
            tags: selectedTagsState,
            participants: selectedUsersState,
            dateStart: !formData.dateStart ? null : formData.dateStart,
            dateEnd: !formData.dateEnd ? null : formData.dateEnd
        };
        await handleFormSubmit(formDataFilled);
    };

    /// ----- REST ----- ///
    const fetchTags = async (): Promise<void> => {
        const {
            message,
            type,
            payload: tags
        } = await request<TTag[]>('getProjectTags', { method: 'GET', params: OPTIONS_LIMIT }, 'tag');
        if (type === 'error' || !tags) return modalContext?.openMessageModal(message, type);
        setTagsState(tags);
    };

    const fetchUsers = async (): Promise<void> => {
        const {
            message,
            type,
            payload: usersRaw
        } = await request<TUser[]>('getUsers', { method: 'GET', params: OPTIONS_LIMIT }, 'user');
        if (type === 'error' || !usersRaw) return modalContext?.openMessageModal(message, type);
        const users: TProjectParticipant[] = usersRaw
            .map((u) => ({ userId: u.userId, username: u.username, projectRoleId: 0, projectRole: '' }))
            .filter((u) => u.userId !== authContext?.userId);
        setUsersState(users);
    };

    /// ----- Handlers ----- ///
    const handleUserSelectChange = (event: ChangeEvent<HTMLSelectElement>): void => {
        const userId = +event.currentTarget.value;
        setSelectedUsersState((prev) => {
            const isSelected = prev.find((u) => u.userId === userId);
            if (isSelected) return prev;

            const selected = usersState.find((u) => u.userId === userId);
            if (!selected) return prev;

            const selectedUser: TProjectParticipant = {
                ...selected,
                projectRoleId: EProjectAccessRole.PROJECT_ROLE_DEVELOPER,
                projectRole: 'Developer'
            };
            return [...prev, selectedUser];
        });
    };

    const handleRoleSelectChange = (event: FormEvent<HTMLSelectElement>, userId: number) => {
        const selectedRoleId = +event.currentTarget.value;
        setSelectedUsersState((prev) => {
            const changedUserIndex = prev.findIndex((u) => u.userId === userId);
            if (changedUserIndex === -1) return prev;
            const newStateUser: TProjectParticipant = {
                ...prev[changedUserIndex],
                projectRoleId: selectedRoleId,
                projectRole: EProjectAccessRole[selectedRoleId]
            };
            const newState: TProjectParticipant[] = [
                ...prev.slice(0, changedUserIndex),
                newStateUser,
                ...prev.slice(changedUserIndex + 1)
            ];
            return newState;
        });
    };

    useEffect(() => {
        if (!authContext?.isLoggedIn || !authContext?.userId) return;
        fetchTags();
        fetchUsers();
    }, [authContext?.isLoggedIn]);

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
                        required={isCreationAction}
                    />
                    <SelectMultiple<TTag>
                        name={TAGS_SELECT_NAME}
                        state={{
                            optionsState: [tagsState, setTagsState],
                            selectedState: [selectedTagsState, setSelectedTagsState]
                        }}
                        data={{
                            getId: getTagId,
                            getText: (tag: TTag) => tag.tag
                        }}
                    />
                    <SelectMultiple<TProjectParticipant>
                        name={PARTICIPANTS_SELECT_NAME}
                        defaultValue={['']}
                        data={{
                            getId: getParticipantId,
                            getText: (u) => u.username,
                            getDefaultValue: (u) => u.projectRoleId
                        }}
                        state={{
                            optionsState: [usersState, setUsersState],
                            selectedState: [selectedUsersState, setSelectedUsersState]
                        }}
                        onChange={handleUserSelectChange}
                        classNames={{
                            list: s.participantsSelect,
                            listElem: s.participantTag
                        }}
                        requireInnerLogic={(optionId, initRole) => (
                            <Select<TProjectRole>
                                className={s.projectRoleSelect}
                                defaultValue={initRole}
                                data={{
                                    options: PROJECT_ROLES,
                                    getId: (role) => role.projectRoleId,
                                    getText: (role) => role.projectRole
                                }}
                                onChange={(event) => handleRoleSelectChange(event, optionId)}
                            />
                        )}
                    />
                    <div className={s.dates}>
                        <input
                            type={'date'}
                            name={'dateStart'}
                            placeholder={'Date start:'}
                            required={isCreationAction}
                            defaultValue={initData?.dateStart || undefined}
                        />
                        <input
                            type={'date'}
                            name={'dateEnd'}
                            placeholder={'Date end:'}
                            required={isCreationAction}
                            defaultValue={initData?.dateEnd || undefined}
                        />
                    </div>
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
