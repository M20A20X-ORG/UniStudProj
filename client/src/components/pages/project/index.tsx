import React, { FC, JSX, useContext, useEffect, useState } from 'react';
import { EProjectAccessRole, PROJECT_ACCESS_ROLE, TProject, TProjectParticipant } from 'types/rest/responses/project';

import { ModalContext } from 'context/Modal.context';
import { AuthContext } from 'context/Auth.context';

import cn from 'classnames';
import { useParams } from 'react-router-dom';

import { request } from 'utils/request';

import { ProjectEditForm } from 'components/modals/ProjectEdit';
import { TaskBoard } from 'components/pages/Project/Taskboard';
import s from './Project.module.scss';

const PROJECT_FALLBACK: Partial<TProject> = {
    projectId: undefined,
    tags: undefined,
    participants: undefined,
    description: undefined,
    dateEnd: undefined,
    dateStart: undefined,
    name: undefined,
    tagsAmount: undefined,
    participantsAmount: undefined
};

export const ProjectPage: FC = () => {
    /// ----- Params ----- ///
    const { id: projectIdParam } = useParams();
    const projectId = parseInt(projectIdParam || '');

    /// ----- Context ----- ///
    const modalContext = useContext(ModalContext);
    const authContext = useContext(AuthContext);

    /// ----- State ----- ///
    const [projectState, setProjectState] = useState<TProject | null>(null);
    const [editSubmitToggle, toggleEditSubmit] = useState<boolean>(false);
    const [isParticipatingProject, setParticipatingProject] = useState<boolean | null>(null);

    const fetchProject = async () => {
        if (isNaN(projectId)) return;
        const { message, type, payload } = await request<TProject[]>(
            'getProject',
            {
                method: 'GET',
                params: [['projectIds[]', projectId]]
            },
            'project'
        );
        const [projectData] = payload || [];
        if (type === 'error' || !projectData) return modalContext?.openMessageModal(message, type);
        setProjectState(projectData);
    };

    /// ----- Render ----- ///
    const renderBtnEditElem = () => {
        const btnElem = (
            <div
                className={s.edit}
                onClick={() => {
                    toggleEditSubmit(true);
                    if (!projectState) return modalContext?.openMessageModal("Can't edit project", 'error');
                    modalContext?.openModal(
                        <ProjectEditForm
                            initData={projectState}
                            editSubmittedState={[editSubmitToggle, toggleEditSubmit]}
                        />,
                        'custom'
                    );
                }}
            >
                <span className={'clickable'}>Edit</span>
            </div>
        );

        const isProjectOwner =
            projectState?.participants &&
            projectState.participants.find(
                (p) => p.userId === authContext?.userId && p.projectRoleId === EProjectAccessRole.PROJECT_ROLE_OWNER
            );

        return <>{authContext?.isLoggedIn && isProjectOwner ? btnElem : null}</>;
    };

    const renderParticipants = (users: TProjectParticipant[] | undefined): JSX.Element => {
        const participants: Record<string, JSX.Element[]> = {};
        users?.forEach((u) => {
            const userElem = (
                <li
                    key={JSON.stringify(u)}
                    className={'tag'}
                >
                    {u.username}
                </li>
            );

            const key = u.projectRoleId;
            const isExists = participants[key];
            if (isExists) isExists.push(userElem);
            else participants[key] = [userElem];
        });

        const participantsELem = Object.keys(PROJECT_ACCESS_ROLE).map((keyRaw) => {
            const key = keyRaw as unknown as keyof typeof PROJECT_ACCESS_ROLE;
            return (
                <>
                    <span className={'cardKey'}>{PROJECT_ACCESS_ROLE[key]}s:</span>
                    <ul className={'tagList'}>{participants[key] ?? '--'}</ul>
                </>
            );
        });

        return <>{participantsELem}</>;
    };

    const renderProjectCommon = (project: TProject | null) => {
        const { projectId, tags, participants: _, description, ...projectCommon } = project || PROJECT_FALLBACK;
        const commonLiElems: JSX.Element[] = Object.keys(projectCommon).map((key) => {
            const value = projectCommon[key as keyof typeof projectCommon];
            return (
                <>
                    <span className={'cardKey'}>{key}:</span>
                    <span>{value ?? '--'}</span>
                </>
            );
        });
        const tagsLiElems: JSX.Element[] | undefined = tags?.map((t) => (
            <li
                key={JSON.stringify(t)}
                className={'tag'}
            >
                {t.tag}
            </li>
        ));
        const tagsLiElem = (
            <>
                <span className={'cardKey'}>Tags:</span>
                <ul className={'tagList'}>{tagsLiElems ?? '--'}</ul>
            </>
        );

        return (
            <>
                <div className={'cardHead'}>
                    <span>Project ID: {projectId ?? '--'}</span>
                </div>
                <div className={s.projectCardCommon}>
                    <ul className={'cardCommon'}>
                        {commonLiElems}
                        {tagsLiElem}
                    </ul>
                    <ul className={cn('cardCommon', s.projectCardParticipants)}>
                        <>{renderParticipants(projectState?.participants)}</>
                    </ul>
                </div>
                <div className={s.description}>
                    <span className={s.descriptionCardKey}>Description:</span>
                    <span className={s.descriptionCardValue}>{description || '--'}</span>
                </div>
            </>
        );
    };

    /// ----- ComponentDidUpdate ------ ///
    useEffect(() => {
        if (!projectState) fetchProject();
        if (isParticipatingProject === null && projectState) {
            setParticipatingProject(
                projectState?.participants.findIndex((u) => u.userId === authContext?.userId) !== -1
            );
        }
    }, [editSubmitToggle, projectState]);

    return (
        <>
            <section>
                <div className={cn('card', s.projectCard)}>{renderProjectCommon(projectState)}</div>
                {renderBtnEditElem()}
            </section>
            {!projectState || !isParticipatingProject ? null : (
                <section className={s.taskBoard}>
                    <TaskBoard projectData={projectState} />
                </section>
            )}
        </>
    );
};
