import { QueryError } from 'mysql2';
import { PoolConnection } from 'mysql2/promise';
import { TDependency, TModifyQueryResponse, TReadQueryResponse } from '@type/sql';
import { TPayloadResponse, TResponse } from '@type/schemas/response';
import { TTag } from '@type/schemas/projects/project';
import { TProjectTask, TTaskCreation, TTaskEdit, TTaskId } from '@type/schemas/projects/tasks';

import { DataAddingError } from '@exceptions/DataAddingError';
import { DataDeletionError } from '@exceptions/DataDeletionError';
import { NoDataError } from '@exceptions/NoDataError';
import { DataModificationError } from '@exceptions/DataModificationError';

import { COMMON_SQL } from '@static/sql/common';
import { TASK_SQL } from '@static/sql/task';

import { updateDependent } from '@utils/updateDependent';

import { sqlPool } from '@configs/sqlPoolConfig';
import { log } from '@configs/loggerConfig';

const { deleteSql, createSql, readSql, updateSql } = TASK_SQL;
const { getSelectLastInsertId } = COMMON_SQL;

type TTasksRaw = Array<
    TProjectTask & {
        tempUserId: number;
        tempUsername: string;
        tempStatusId: number;
        tempStatus: string;
    }
>;

interface TasksService {
    getTasks: (...taskIds: number[]) => Promise<TPayloadResponse<TProjectTask[]>>;
    createTask: (taskData: TTaskCreation) => Promise<TResponse>;
    editTask: (taskData: TTaskEdit) => Promise<TPayloadResponse<TProjectTask[]>>;
    deleteTask: (projectId: number, taskId: number) => Promise<TResponse>;
}

class TasksServiceImpl implements TasksService {
    ///// Private /////
    private _insertProjectCommon = async (
        taskCommonData: Omit<TTaskCreation, 'tagIds'>,
        connection: PoolConnection
    ) => {
        const { insertTask } = createSql;
        const { name, description, projectId, statusId, assignUserId } = taskCommonData;
        try {
            const dbProjectResponse: TModifyQueryResponse = await connection.query(insertTask, [
                name,
                projectId,
                description,
                statusId,
                assignUserId
            ]);
            log.debug(dbProjectResponse);
        } catch (error: unknown) {
            const { code } = error as QueryError;

            let message = '';
            if (code === 'ER_DUP_ENTRY') message = `Task '${name}' already exists!`;
            else if (code === 'ER_NO_REFERENCED_ROW_2')
                message = 'Specified task status or user are not exists!';

            if (message) throw new DataAddingError(message);
            throw error;
        }
    };

    private _insertTags = async (taskId: number, tagIds: number[], connection: PoolConnection) => {
        try {
            const { getInsertTagsSql } = createSql;
            const insertTaskTags = getInsertTagsSql(taskId, tagIds);
            const dbTagsResponse: TModifyQueryResponse = await connection.query(
                insertTaskTags,
                taskId
            );
            log.debug(dbTagsResponse);
        } catch (error: unknown) {
            const { code } = error as QueryError;

            let message = '';
            if (code === 'ER_DUP_ENTRY') message = 'Specified tag already added to this task!';
            else if (code === 'ER_NO_REFERENCED_ROW_2') message = 'Specified tag are not exists!';

            if (message) throw new DataAddingError(message);
            throw error;
        }
    };

    ///// Public /////
    public deleteTask = async (projectId: number, taskId: number): Promise<TResponse> => {
        const { selectTaskName, deleteTask, deleteTaskTags } = deleteSql;

        const connection = await sqlPool.getConnection();
        try {
            await connection.beginTransaction();

            const dbTaskNameResponse: TReadQueryResponse = await connection.query(selectTaskName, [
                projectId,
                taskId
            ]);
            const [[dbTaskName]] = dbTaskNameResponse;
            if (!dbTaskName) throw new DataDeletionError(`No task found, id: '${taskId}'`);
            const { name } = dbTaskName as Pick<TProjectTask, 'name'>;

            const dbDeleteTaskResponse: TModifyQueryResponse = await connection.query(deleteTask, [
                projectId,
                taskId
            ]);
            log.debug(dbDeleteTaskResponse);

            const dbDeleteTagsResponse: TModifyQueryResponse = await connection.query(
                deleteTaskTags,
                taskId
            );
            log.debug(dbDeleteTagsResponse);

            return { message: `Successfully deleted task, name: '${name}'` };
        } catch (error: unknown) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    };

    public getTasks = async (projectId: number): Promise<TPayloadResponse<TProjectTask[]>> => {
        const { selectTasks, selectTags } = readSql;

        const dbTasksResponse: TReadQueryResponse = await sqlPool.query(selectTasks, [projectId]);
        const [dbTasks] = dbTasksResponse;
        if (!dbTasks.length) throw new NoDataError(`No project found, id: '${projectId}'`);
        const tasksRaw = dbTasks as TTasksRaw;
        const tasks: TProjectTask[] = tasksRaw.map((taskRaw) => {
            const { tempUserId, tempUsername, tempStatusId, tempStatus, ...task } = taskRaw;
            task.assignUser = { userId: tempUserId, username: tempUsername };
            task.status = { statusId: tempStatusId, status: tempStatus };
            return task;
        });

        const dbTagsResponse: TReadQueryResponse = await sqlPool.query(selectTags, [projectId]);
        const [dbTags] = dbTagsResponse;
        if (dbTags.length) {
            const tags = dbTags as Array<TDependency<TTaskId, TTag>>;
            tasks.forEach(
                (task) =>
                    (task.tags = tags
                        .filter((tag) => tag.taskId === task.taskId)
                        .map((tag) => {
                            delete tag['taskId'];
                            return tag;
                        }))
            );
        }

        return {
            message: `Successfully got tasks, project id: '${projectId}'`,
            payload: tasks
        };
    };

    public createTask = async (taskData: TTaskCreation): Promise<TResponse> => {
        const { tagIds, ...taskCommonData } = taskData;

        const connection = await sqlPool.getConnection();
        try {
            await connection.beginTransaction();
            await this._insertProjectCommon(taskCommonData, connection);

            const dbNewTaskIdResponse: TReadQueryResponse = await connection.query(
                getSelectLastInsertId('taskId')
            );
            const [[dbNewTaskId]] = dbNewTaskIdResponse;
            if (!dbNewTaskId) throw new DataAddingError("Can't add new task!");
            const { taskId: newTaskId } = dbNewTaskId as TTaskId;

            if (tagIds.length) await this._insertTags(newTaskId, tagIds, connection);
            await connection.commit();
        } catch (error: unknown) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

        return { message: `Successfully added new task, name: '${taskCommonData.name}'` };
    };

    public editTask = async (taskData: TTaskEdit): Promise<TPayloadResponse<TProjectTask[]>> => {
        const { getUpdateTaskCommon, getUpdateTagsSql } = updateSql;
        const { tagIds, deleteTagIds, ...taskCommonData } = taskData;

        const connection = await sqlPool.getConnection();
        try {
            await connection.beginTransaction();
            try {
                const updateTaskCommonSql = getUpdateTaskCommon(taskCommonData);
                const dbTaskCommon: TModifyQueryResponse = await connection.query(
                    updateTaskCommonSql
                );
                log.debug(dbTaskCommon);
            } catch (error: unknown) {
                const { code } = error as QueryError;
                if (code === 'ER_NO_REFERENCED_ROW_2')
                    throw new DataModificationError(`Specified userId or statusId are not exists!`);
                throw error;
            }
            await updateDependent<number>(
                connection,
                getUpdateTagsSql,
                taskCommonData.taskId,
                tagIds,
                deleteTagIds,
                'tag'
            );
            await connection.commit();
        } catch (error: unknown) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

        const { payload: tasks } = await this.getTasks(taskCommonData.projectId);
        return {
            message: `Successfully updated project task, name: '${taskCommonData.name}'`,
            payload: tasks
        };
    };
}

export const tasksService = new TasksServiceImpl();
