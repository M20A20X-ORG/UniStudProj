import { QueryError } from 'mysql2';
import { PoolConnection } from 'mysql2/promise';

import { TPayloadResponse, TResponse } from '@type/schemas/response';
import { TProjectTask, TTaskCreation, TTaskPartial } from '@type/schemas/projects/tasks';

import { TASK_SQL } from '@static/sql/task';

import { DataAddingError } from '@exceptions/DataAddingError';
import { DataDeletionError } from '@exceptions/DataDeletionError';

import { sqlPool } from '@configs/sqlPool';

const { deleteSql, createSql } = TASK_SQL;

interface TasksService {
    getTasks?: (...taskIds: number[]) => Promise<TPayloadResponse<TProjectTask[]>>;
    createTask: (taskData: TTaskCreation) => Promise<TResponse>;
    createTaskStatus: (status: string) => Promise<TResponse>;
    editTask?: (taskData: TTaskPartial) => Promise<TPayloadResponse<TProjectTask>>;
    deleteTask: (projectId: number, taskId: number) => Promise<TResponse>;
}

class TasksServiceImpl implements TasksService {
    ///// Private /////
    private _insertProjectCommon = async (
        taskCommonData: Omit<TTaskCreation, 'tagIds'>,
        connection: PoolConnection
    ) => {
        const { name, description, projectId, statusId, assignUserId } = taskCommonData;
        try {
            await connection.query(createSql.insertTask, [
                name,
                projectId,
                description,
                statusId,
                assignUserId
            ]);
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
            const insertTaskTags = createSql.getInsertTagsSql(taskId, tagIds);
            await connection.query(insertTaskTags, taskId);
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

            const dbTaskNameResponse = await connection.query(selectTaskName, [projectId, taskId]);
            const [[dbTaskName]] = dbTaskNameResponse;
            if (!dbTaskName) throw new DataDeletionError(`No task found, id: '${taskId}'`);
            const { name } = dbTaskName as Pick<TProjectTask, 'name'>;

            await connection.query(deleteTask, [projectId, taskId]);
            await connection.query(deleteTaskTags, taskId);

            return { message: `Successfully deleted task, name: '${name}'` };
        } catch (error: unknown) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    };

    public createTaskStatus = async (status: string): Promise<TResponse> => {
        try {
            await sqlPool.query(createSql.insertTaskStatus, [status]);
        } catch (error: unknown) {
            const { code } = error as QueryError;
            if (code === 'ER_DUP_ENTRY')
                throw new DataAddingError(`Task '${status}' already exists!`);
            throw error;
        }
        return { message: `Successfully added new task status: '${status}'` };
    };

    public createTask = async (taskData: TTaskCreation): Promise<TResponse> => {
        const { tagIds, ...taskCommonData } = taskData;

        const connection = await sqlPool.getConnection();
        try {
            await connection.beginTransaction();
            await this._insertProjectCommon(taskCommonData, connection);

            const dbNewTaskIdResponse = await connection.query(createSql.selectNewTaskId);
            const [[dbNewTaskId]] = dbNewTaskIdResponse;
            if (!dbNewTaskId) throw new DataAddingError("Can't add new task!");
            const { taskId: newTaskId } = dbNewTaskId as Pick<TProjectTask, 'taskId'>;

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
}

export const tasksService = new TasksServiceImpl();
