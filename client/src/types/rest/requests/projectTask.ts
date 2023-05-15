import { TProjectId } from 'types/rest/responses/project';
import { TProjectTask } from 'types/rest/responses/projectTask';

export type TTaskJson<T> = { task: T };

export type TTaskId = Pick<TProjectTask, 'taskId'>;
export type TTaskCreation = Pick<TProjectTask, 'projectId' | 'name' | 'description'> & {
    assignUserId: number | null;
    statusId: number | null;
    newTagIds: Array<number>;
};
export type TTaskEdit = TTaskId & TProjectId & Partial<TTaskCreation & { deleteTagIds: Array<number> }>;
