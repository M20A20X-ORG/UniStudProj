import { TProjectId, TTag } from '@type/schemas/projects/project';
import { TUser } from '@type/schemas/user';

export type TTaskStatus = { statusId: number; status: string };
export type TAssignedUser = Pick<TUser, 'userId' | 'username'>;
export type TProjectTask = TProjectId & {
    taskId: number;
    name: string;
    description: string;
    status: TTaskStatus | null;
    assignUser: TAssignedUser | null;
    tags: TTag[];
};

export type TTaskJson<T> = { task: T };

export type TTaskId = Pick<TProjectTask, 'taskId'>;
export type TTaskCreation = TProjectId &
    Pick<TProjectTask, 'name' | 'description'> & {
        assignUserId: number;
        statusId: number;
        newTagIds: Array<number>;
    };
export type TTaskEdit = TTaskId &
    TProjectId &
    Partial<TTaskCreation & { deleteTagIds: Array<number> }>;
export type TTaskEditCommon = Omit<TTaskEdit, 'newTagIds' | 'deleteTagIds'>;
