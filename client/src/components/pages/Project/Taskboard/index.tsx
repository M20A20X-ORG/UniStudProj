import React, { ChangeEvent, FC, JSX, useContext, useEffect, useState } from 'react';
import { TProjectTask } from 'types/rest/responses/projectTask';
import { TProject } from 'types/rest/responses/project';

import { ModalContext } from 'context/Modal.context';
import { AuthContext } from 'context/Auth.context';

import cn from 'classnames';
import { request } from 'utils/request';

import { ProjectTaskEditForm } from 'components/modals/ProjectTaskEdit';
import { ProjectTaskCreationForm } from 'components/modals/ProjectTaskCreation';

import s from './Taskboard.module.scss';

const NO_ASSIGNED_TEXT = 'Unassigned';
const NO_STATUS_TEXT = 'No status';
const CREATE_TASK_VALUE = 'create';

interface TaskBoardProps {
    projectData: TProject;
}

export const TaskBoard: FC<TaskBoardProps> = ({ projectData }) => {
    const { projectId } = projectData;

    /// ----- Context ----- ///
    const modalContext = useContext(ModalContext);
    const authContext = useContext(AuthContext);

    /// ----- State ----- ///
    const [tasksState, setTasksState] = useState<TProjectTask[]>([]);
    const [updateToggle, toggleUpdate] = useState<boolean>(false);

    const updateTasksState = async () => {
        if (isNaN(projectId)) return;
        const { payload } = await request<TProjectTask[]>(
            'getProjectTasks',
            {
                method: 'GET',
                params: [['projectId', projectId]],
                headers: { 'project-id': projectId.toString() }
            },
            'project/task'
        );
        const tasksData = payload || [];
        if (tasksData) setTasksState(tasksData);
    };

    /// ----- Handlers ----- ///
    const handleActionSelectChange = (event: ChangeEvent<HTMLSelectElement>): void => {
        const { value } = event.currentTarget;
        event.currentTarget.value = '';
        if (!authContext?.isLoggedIn)
            return modalContext?.openMessageModal("Can't create project - user are not authorized!", 'error');
        if (value === CREATE_TASK_VALUE) {
            modalContext?.openModal(
                <ProjectTaskCreationForm
                    projectData={projectData}
                    editSubmittedState={[updateToggle, toggleUpdate]}
                />,
                'custom'
            );
        }
    };

    /// ----- Render ----- ///
    const renderTasks = (tasks: TProjectTask[]): JSX.Element[] => {
        return tasks.map((t) => {
            const taskTagElems: JSX.Element[] = t.tags.map(({ tag }) => (
                <li
                    key={JSON.stringify({ [t.taskId]: tag })}
                    className={'tag'}
                >
                    {tag}
                </li>
            ));
            return (
                <li
                    key={JSON.stringify(t)}
                    className={s.taskItem}
                    onClick={() =>
                        modalContext?.openModal(
                            <ProjectTaskEditForm
                                projectData={projectData}
                                editSubmittedState={[updateToggle, toggleUpdate]}
                                initData={t}
                            />,
                            'custom'
                        )
                    }
                >
                    <div className={s.taskItemHead}>
                        <span>{t.name}</span>
                        <span className={'tag'}>{t.assignUser?.username || NO_ASSIGNED_TEXT}</span>
                    </div>
                    <div className={s.taskItemBody}>
                        <span>{t.description}</span>
                    </div>
                    <ul className={cn('tagList', s.taskItemTagList)}>{taskTagElems}</ul>
                </li>
            );
        });
    };

    const renderTaskBoard = (tasks: TProjectTask[]): JSX.Element => {
        const taskBoard: Record<string, TProjectTask[]> = {};
        tasks.forEach((task) => {
            const key = task.status?.status || NO_STATUS_TEXT;
            const taskStatus = taskBoard[key];
            if (taskStatus) taskStatus.push(task);
            else taskBoard[key] = [task];
        });

        const boardColumnElems: JSX.Element[] = Object.entries(taskBoard).map(([status, tasks]) => {
            const taskElems: JSX.Element[] = renderTasks(tasks);
            return (
                <li
                    key={status}
                    className={s.taskColumn}
                >
                    <div className={s.taskColumnHead}>{status}</div>
                    <ul className={s.taskColumnBody}>{taskElems} </ul>
                </li>
            );
        });
        return <>{boardColumnElems}</>;
    };

    /// ----- ComponentDidUpdate ------ ///
    useEffect(() => {
        updateTasksState();
    }, [updateToggle, authContext?.isLoggedIn]);

    return (
        <div className={s.taskBoardWrapper}>
            <div className={s.actionsContainer}>
                <select
                    className={cn(s.actionsSelect, 'clickable')}
                    onChange={handleActionSelectChange}
                >
                    <option style={{ display: 'none' }} />
                    <option
                        className={s.actionsBtn}
                        value={CREATE_TASK_VALUE}
                    >
                        Create task
                    </option>
                </select>
            </div>
            <ul className={s.taskBoard}>{renderTaskBoard(tasksState)}</ul>
        </div>
    );
};
