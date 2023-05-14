import React, { ChangeEvent, FC, JSX, MouseEvent, useContext, useRef, useState } from 'react';
import { TUser } from 'types/rest/responses/auth';
import { EProjectAccessRole, TProject, TProjectParticipant } from 'types/rest/responses/project';
import { TTag } from 'types/rest/responses/tag';

import { OPTIONS_LIMIT } from 'assets/static/common';

import { ModalContext } from 'context/Modal.context';
import { AuthContext } from 'context/Auth.context';

import cn from 'classnames';
import { formToObj } from 'utils/formToObj';
import { fetchUrl } from 'utils/fetchUrl';

import s from './projectConstructor.module.scss';

type TParticipantOption = Pick<TUser, 'userId' | 'username'>;
type TFormInitialData = Omit<TProject, 'projectId' | 'participantsAmount' | 'tagsAmount'>;
export type TProjectFormData = Required<TFormInitialData>;
export type TProjectFormCommonData = Omit<TProjectFormData, 'tags' | 'participants'>;

const TAGS_SELECT_NAME = 'tags';
const PARTICIPANTS_SELECT_NAME = 'participants';

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
    const [usersState, setUsersState] = useState<TParticipantOption[]>([]);
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

    const handleTagSelectChange = (event: ChangeEvent<HTMLSelectElement>): void => {
        const tagId = +event.currentTarget.value;
        setSelectedTagsState((prev) => {
            const isTagSelected = prev.find((t) => t.tagId === tagId);
            if (isTagSelected) return prev;

            const selected = tagsState.find((t) => t.tagId === tagId);
            if (!selected) return prev;

            return [...prev, selected];
        });
    };

    const handleTagsSelectClick = async (event: MouseEvent<HTMLSelectElement>): Promise<void> => {
        event.currentTarget.value = '';
        const {
            message,
            type,
            payload: tags
        } = await fetchUrl<TTag>('getProjectTags', 'projectIds', [], 'tag', OPTIONS_LIMIT);
        if (type === 'error' || !tags) return modalContext?.openMessageModal(message, type);
        setTagsState(tags);
    };

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

    const handleUserSelectClick = async (event: MouseEvent<HTMLSelectElement>): Promise<void> => {
        event.currentTarget.value = '';
        const {
            message,
            type,
            payload: usersRaw
        } = await fetchUrl<TUser>('getUsers', 'userIdentifiers', [], 'user', OPTIONS_LIMIT);
        if (type === 'error' || !usersRaw) return modalContext?.openMessageModal(message, type);
        const users = usersRaw
            .map(({ userId, username }) => ({ userId, username }))
            .filter((u) => u.userId !== authContext?.userId);
        setUsersState(users);
    };

    const handleRoleSelectChange = (event: ChangeEvent<HTMLSelectElement>, userId: number) => {
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

    /// ----- Render ----- ///
    const renderTagsSelect = (): JSX.Element => {
        const selectedElems: JSX.Element[] = selectedTagsState.map((tag) => (
            <li
                key={JSON.stringify(tag)}
                className={cn(s.selectedOption, s.selectedOptionTag)}
            >
                <span
                    className={cn('clickable', 'btnClose', s.closeBtn)}
                    onClick={() => setSelectedTagsState((prev) => prev.filter((t) => t.tagId !== tag.tagId))}
                />
                <span>{tag.tag}</span>
            </li>
        ));
        const optionElems: JSX.Element[] = tagsState.map((t) => (
            <option
                key={JSON.stringify(t)}
                value={t.tagId}
            >
                {t.tag}
            </option>
        ));

        return (
            <span className={'selectWrapper'}>
                <ul className={cn(s.selectedList, s.selectedListTags)}>{selectedElems}</ul>
                <select
                    name={TAGS_SELECT_NAME}
                    defaultValue={''}
                    onChange={handleTagSelectChange}
                    onClick={handleTagsSelectClick}
                >
                    {optionElems}
                </select>
            </span>
        );
    };

    const renderUsersSelect = (): JSX.Element => {
        const selectedElems: JSX.Element[] = selectedUsersState.map((su) => (
            <li
                key={JSON.stringify(su)}
                value={su.userId}
                className={s.selectedOption}
            >
                <span
                    className={cn('clickable', 'btnClose', s.closeBtn)}
                    onClick={() => {
                        setSelectedUsersState((prev) => prev.filter((u) => u.userId !== su.userId));
                    }}
                />
                <span>{su.username}</span>
                <span className={cn('selectWrapper', s.projectRoleSelectWrapper)}>
                    <select
                        required={isCreationAction}
                        defaultValue={su.projectRoleId}
                        onChange={(event) => handleRoleSelectChange(event, su.userId)}
                    >
                        <option value={EProjectAccessRole.PROJECT_ROLE_MANAGER}>Manager</option>
                        <option value={EProjectAccessRole.PROJECT_ROLE_MENTOR}>Mentor</option>
                        <option value={EProjectAccessRole.PROJECT_ROLE_DEVELOPER}>Developer</option>
                    </select>
                </span>
            </li>
        ));
        const optionElems: JSX.Element[] = usersState.map((u) => (
            <option
                key={JSON.stringify(u)}
                value={u.userId}
            >
                {u.username}
            </option>
        ));

        return (
            <span className={cn('selectWrapper', s.select)}>
                <ul className={s.selectedList}>{selectedElems}</ul>
                <select
                    name={PARTICIPANTS_SELECT_NAME}
                    defaultValue={''}
                    onChange={handleUserSelectChange}
                    onClick={handleUserSelectClick}
                >
                    {optionElems}
                </select>
            </span>
        );
    };

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

                    {renderTagsSelect()}
                    {renderUsersSelect()}
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
