import { TTag } from '@type/schemas/projects/project';
import { TUser } from '@type/schemas/user';

export type TTaskStatus = { statusId: number; status: string };
export type TProjectTask = {
    taskId: number;
    projectId: number;
    name: string;
    description?: string;
    status: TTaskStatus;
    assignUser: Pick<TUser, 'userId' | 'username'>;
    tags: TTag[];
};

export type TTaskJson<T> = { task: T };

export type TTaskCreation = Pick<TProjectTask, 'name' | 'description' | 'projectId'> & {
    assignUserId: number;
    statusId: number;
    tagIds: Array<number>;
};
export type TTaskPartial = Pick<TProjectTask, 'taskId' | 'projectId'> & Partial<TTaskCreation>;
