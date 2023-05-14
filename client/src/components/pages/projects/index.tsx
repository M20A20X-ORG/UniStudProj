import React, { ChangeEvent, FC, JSX, useContext, useEffect, useState } from 'react';
import { TProject } from 'types/rest/responses/project';

import { OPTIONS_LIMIT } from 'assets/static/common';

import { ModalContext } from 'context/Modal.context';
import { AuthContext } from 'context/Auth.context';

import { Link } from 'react-router-dom';
import { fetchUrl } from 'utils/fetchUrl';

import cn from 'classnames';
import { ProjectCreationForm } from 'components/modals/projectCreation';
import s from './projects.module.scss';

type TProjectCommon = Omit<TProject, 'projectId' | 'tags' | 'participants'>;
const CREATE_PROJECT_VALUE = 'create';

export const ProjectsPage: FC = () => {
    const modalContext = useContext(ModalContext);
    const authContext = useContext(AuthContext);

    const [projectsState, setProjectsState] = useState<TProject[]>([]);

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
        } = await fetchUrl<TProject>('getProject', 'projectIds', [], 'project', OPTIONS_LIMIT);
        if (type === 'error' || !projectsData) return modalContext?.openMessageModal(message, type);
        setProjectsState(projectsData);
    };

    useEffect(() => {
        updateProjectsState();
    }, []);

    return (
        <>
            <div>
                <h1 className={s.projectsHeader}>Projects</h1>
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
