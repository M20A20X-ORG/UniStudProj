import React, { FC, JSX, useContext, useEffect, useState } from 'react';
import { TFuncResponse } from 'types/rest';
import { TServerResponse } from 'types/rest/responses/serverResponse';
import { EProjectRole, TProject } from 'types/rest/responses/project';

import { ModalContext } from 'context/Modal.context';
import { AuthContext } from 'context/Auth.context';

import { useParams } from 'react-router-dom';
import { getApi } from 'utils/getApi';
import { validateSchema } from 'utils/validateSchema';

import { ProjectEditForm } from 'components/modals/projectEdit';

import s from './project.module.scss';

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

    /// ----- REST ----- ///
    const fetchProject = async (projectId: number): Promise<TFuncResponse<TProject>> => {
        const query = getApi('getProject') + '?projectIds[]=' + projectId;

        try {
            const response = await fetch(query);
            if (response.status === 500) return { message: response.statusText, type: 'error' };
            const json = (await response.json()) as TServerResponse<TProject[]>;

            const message = json?.message || response.statusText;
            if (!response.ok) return { message, type: 'error' };

            const { payload } = json || {};
            const [projectData] = payload || [];

            const validationResult = validateSchema(projectData, 'http://example.com/schema/project');
            if (validationResult) {
                return {
                    message: `Incorrect response from server: ${JSON.stringify(validationResult)}`,
                    type: 'error'
                };
            }

            return {
                message,
                type: 'info',
                payload: projectData as TProject
            };
        } catch (error: unknown) {
            const { message } = error as Error;
            return { message, type: 'error' };
        }
    };

    /// ----- Render ----- ///
    const renderBtnElem = () => {
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
                (p) => p.userId === authContext?.userId && p.projectRoleId === EProjectRole.PROJECT_ROLE_OWNER
            );

        return <>{authContext?.isLoggedIn && isProjectOwner ? btnElem : null}</>;
    };

    const renderTags = (): JSX.Element => {
        let tagElems: JSX.Element[] | undefined = undefined;
        if (projectState?.tags)
            tagElems = projectState?.tags.map((t) => (
                <span
                    key={JSON.stringify(t)}
                    className={s.tag}
                >
                    {t.tag}
                </span>
            ));
        return <span>{tagElems ?? '--'}</span>;
    };

    const renderParticipants = (): JSX.Element => {
        let participants: { [p: string]: JSX.Element } | undefined = undefined;

        if (projectState?.participants) {
            const participantEntries: [EProjectRole, JSX.Element][] = projectState.participants.map((p) => [
                p.projectRoleId,
                <span
                    key={JSON.stringify(p)}
                    className={s.tag}
                >
                    {p.username}
                </span>
            ]);
            participants = Object.fromEntries(participantEntries);
        }

        return (
            <>
                <span className={s.infoKey}>Owner:</span>
                <span>{participants?.[EProjectRole.PROJECT_ROLE_OWNER] ?? '--'}</span>
                <span className={s.infoKey}>Managers:</span>
                <span>{participants?.[EProjectRole.PROJECT_ROLE_MANAGER] ?? '--'}</span>
                <span className={s.infoKey}>Mentors:</span>
                <span>{participants?.[EProjectRole.PROJECT_ROLE_MENTOR] ?? '--'}</span>
                <span className={s.infoKey}>Developers:</span>
                <span>{participants?.[EProjectRole.PROJECT_ROLE_DEVELOPER] ?? '--'}</span>
            </>
        );
    };

    const updateProjectState = async () => {
        if (isNaN(projectId)) return;
        const { message, type, payload: projectData } = await fetchProject(projectId);
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
                <div className={s.info}>
                    <ul className={s.infoCommon}>
                        <span className={s.infoKey}>Name:</span>
                        <span>{projectState?.name ?? '--'}</span>
                        <span className={s.infoKey}>Participants:</span>
                        <span>{projectState?.participantsAmount ?? '--'}</span>
                        <span className={s.infoKey}>Date start:</span>
                        <span>{projectState?.dateStart ?? '--'}</span>
                        <span className={s.infoKey}>Date end:</span>
                        <span>{projectState?.dateEnd ?? '--'}</span>
                        <span className={s.infoKey}>Tags:</span>
                        <>{renderTags()}</>
                    </ul>
                    <ul className={s.infoParticipants}>
                        <>{renderParticipants()}</>
                    </ul>
                </div>
                <div className={s.description}>
                    <span className={s.infoKey}>Description:</span>
                    <span>{projectState?.description || '--'}</span>
                </div>
                {renderBtnElem()}
            </section>
            <section></section>
        </>
    );
};
