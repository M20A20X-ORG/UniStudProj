import React, { ChangeEvent, FC, JSX, useContext, useEffect, useState } from 'react';
import { TProject } from 'types/rest/responses/project';

import { OPTIONS_LIMIT } from 'assets/static/common';

import { ModalContext } from 'context/Modal.context';
import { AuthContext } from 'context/Auth.context';

import { Link } from 'react-router-dom';
import cn from 'classnames';
import { request } from 'utils/request';

import { ProjectCreationForm } from 'components/modals/ProjectCreation';

import s from './Projects.module.scss';

type TProjectCommon = Omit<TProject, 'projectId' | 'tags' | 'participants'>;

const CREATE_PROJECT_VALUE = 'create';

export const ProjectsPage: FC = () => {
    /// ----- Context / State ----- ///
    const modalContext = useContext(ModalContext);
    const authContext = useContext(AuthContext);

    const [projectsState, setProjectsState] = useState<TProject[]>([]);

    /// ----- Render ----- ///
    const renderProjectCard = (project: TProject) => {
        const { projectId, tags, participants: ___, ...projectCommon } = project;
        const commonLiElems: JSX.Element[] = Object.keys(projectCommon).map((key) => {
            const value = projectCommon[key as keyof TProjectCommon];
            return (
                <>
                    <span className={'cardKey'}>{key}:</span>
                    <span>{typeof value === 'string' ? value || '--' : value ?? '--'}</span>
                </>
            );
        });
        const tagsLiElems: JSX.Element[] = tags.map((t) => (
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
                <ul className={'tagList'}>{tagsLiElems.length ? tagsLiElems : '--'}</ul>
            </>
        );

        return (
            <>
                <div className={'cardHead'}>
                    <span>Project ID: {projectId}</span>
                </div>
                <ul className={cn('cardCommon', s.projectCardCommon)}>
                    {commonLiElems}
                    {tagsLiElem}
                </ul>
            </>
        );
    };

    const renderProjectsList = (projects: TProject[]): JSX.Element[] => {
        return projects.map((p) => (
            <li
                key={JSON.stringify(p)}
                className={'sectionLike card'}
            >
                <Link to={p.projectId.toString()}>{renderProjectCard(p)}</Link>
            </li>
        ));
    };

    /// ----- Handlers ----- ///
    const handleActionSelectChange = (event: ChangeEvent<HTMLSelectElement>): void => {
        const { value } = event.currentTarget;
        event.currentTarget.value = '';
        if (!authContext?.isLoggedIn)
            return modalContext?.openMessageModal("Can't create project - user are not authorized!", 'error');
        if (value === CREATE_PROJECT_VALUE) modalContext?.openModal(<ProjectCreationForm />, 'custom');
    };

    const updateProjectsState = async (): Promise<void> => {
        const {
            message,
            type,
            payload: projectsData
        } = await request<TProject[]>('getProject', { method: 'GET', params: OPTIONS_LIMIT }, 'project');
        if (type === 'error' || !projectsData) return modalContext?.openMessageModal(message, type);
        setProjectsState(projectsData);
    };

    /// ----- componentDidMount ----- ///
    useEffect(() => {
        updateProjectsState();
    }, []);

    return (
        <>
            <div>
                <h1
                    className={s.projectsHeader}
                    role={'header'}
                >
                    Projects
                </h1>
                <div className={s.actionsContainer}>
                    <select
                        className={cn(s.actionsSelect, 'clickable')}
                        onChange={handleActionSelectChange}
                    >
                        <option style={{ display: 'none' }} />
                        <option
                            className={s.actionsBtn}
                            value={CREATE_PROJECT_VALUE}
                        >
                            Create project
                        </option>
                    </select>
                </div>
            </div>
            <ul>{renderProjectsList(projectsState)}</ul>
        </>
    );
};
