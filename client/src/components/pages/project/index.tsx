import React, { FC, JSX, useContext, useEffect, useState } from 'react';
import { EProjectAccessRole, PROJECT_ACCESS_ROLE, TProject } from 'types/rest/responses/project';

import { ModalContext } from 'context/Modal.context';
import { AuthContext } from 'context/Auth.context';

import cn from 'classnames';
import { useParams } from 'react-router-dom';

import { fetchUrl } from 'utils/fetchUrl';

import { ProjectEditForm } from 'components/modals/projectEdit';

import s from './project.module.scss';

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

    const renderParticipants = (): JSX.Element => {
        const participantEntries: [EProjectAccessRole, JSX.Element][] | undefined = projectState?.participants.map(
            (p) => [
                p.projectRoleId,
                <li
                    key={JSON.stringify(p)}
                    className={'tag'}
                >
                    {p.username}
                </li>
            ]
        );
        const participants = Object.fromEntries(participantEntries || []);
        const participantsELem = Object.keys(PROJECT_ACCESS_ROLE).map((keyRaw) => {
            const key = keyRaw as unknown as keyof typeof PROJECT_ACCESS_ROLE;
            return (
                <>
                    <span className={'cardKey'}>{PROJECT_ACCESS_ROLE[key]}:</span>
                    <ul className={'tagList'}>{participants[key] ?? '--'}</ul>
                </>
            );
        });

        return <>{participantsELem}</>;
    };

    const renderProjectCommon = (project: TProject | null) => {
        const { projectId, tags, participants, description, ...projectCommon } = project || PROJECT_FALLBACK;
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
                        <>{renderParticipants()}</>
                    </ul>
                </div>
                <div className={s.description}>
                    <span className={s.descriptionCardKey}>Description:</span>
                    <span className={s.descriptionCardValue}>{description || '--'}</span>
                </div>
            </>
        );
    };

    const updateProjectState = async () => {
        if (isNaN(projectId)) return;
        const { message, type, payload } = await fetchUrl<TProject>('getProject', 'projectIds', [projectId], 'project');
        const [projectData] = payload || [];
        if (type === 'error' || !projectData) return modalContext?.openMessageModal(message, type);
        setProjectState(projectData);
    };

    /// ----- ComponentDidUpdate ------ ///
    useEffect(() => {
        updateProjectState();
    }, [editSubmitToggle]);

    return (
        <>
            <section className={''}>
                <div className={cn('card', s.projectCard)}>{renderProjectCommon(projectState)}</div>
                {renderBtnEditElem()}
            </section>
            <section></section>
        </>
    );
};
