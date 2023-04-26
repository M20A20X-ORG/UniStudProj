import { QueryError } from 'mysql2';
import { PoolConnection } from 'mysql2/promise';
import { TDependency } from '@type/sql';
import { TPayloadResponse, TResponse } from '@type/schemas/response';
import { TProjectTag } from '@type/schemas/projects/project';
import { TProjectTask, TTaskCreation, TTaskEdit, TTaskId } from '@type/schemas/projects/tasks';

import { DataAddingError } from '@exceptions/DataAddingError';
import { DataDeletionError } from '@exceptions/DataDeletionError';
import { NoDataError } from '@exceptions/NoDataError';
import { DataModificationError } from '@exceptions/DataModificationError';

import { TASK_SQL } from '@static/sql/task';
import { sqlPool } from '@configs/sqlPool';
import { updateDependent } from '@utils/updateDependent';

const { deleteSql, createSql, readSql, updateSql } = TASK_SQL;

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

    public getTasks = async (projectId: number): Promise<TPayloadResponse<TProjectTask[]>> => {
        const { selectTasks, selectTags } = readSql;

        const dbTasksResponse = await sqlPool.query(selectTasks, [projectId]);
        const [dbTasks] = dbTasksResponse as any[];
        if (!dbTasks.length) throw new NoDataError(`No project found, id: '${projectId}'`);
        const tasksRaw = dbTasks as TTasksRaw;
        const tasks: TProjectTask[] = tasksRaw.map((taskRaw) => {
            const { tempUserId, tempUsername, tempStatusId, tempStatus, ...task } = taskRaw;
            task.assignUser = { userId: tempUserId, username: tempUsername };
            task.status = { statusId: tempStatusId, status: tempStatus };
            return task;
        });

        const dbTagsResponse = await sqlPool.query(selectTags, [projectId]);
        const [dbTags] = dbTagsResponse as any[];
        if (dbTags.length) {
            const tags = dbTags as Array<TDependency<TTaskId, TProjectTag>>;
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

            const dbNewTaskIdResponse = await connection.query(createSql.selectNewTaskId);
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
                await connection.query(getUpdateTaskCommon(taskCommonData));
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
