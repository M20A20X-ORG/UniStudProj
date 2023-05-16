import { TTag } from 'types/rest/responses/tag';
import { TUser } from 'types/rest/responses/auth';
import { TProjectId } from 'types/rest/responses/project';

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
