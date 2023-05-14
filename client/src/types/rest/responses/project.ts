import { TTag } from 'types/rest/responses/tag';

export enum EProjectAccessRole {
    PROJECT_ROLE_OWNER = 1,
    PROJECT_ROLE_MANAGER,
    PROJECT_ROLE_MENTOR,
    PROJECT_ROLE_DEVELOPER
}

export const PROJECT_ACCESS_ROLE: { [key in EProjectAccessRole]: string } = Object.freeze({
    [EProjectAccessRole.PROJECT_ROLE_OWNER]: 'Owner',
    [EProjectAccessRole.PROJECT_ROLE_MANAGER]: 'Maneger',
    [EProjectAccessRole.PROJECT_ROLE_MENTOR]: 'Mentor',
    [EProjectAccessRole.PROJECT_ROLE_DEVELOPER]: 'Developer'
});

export type TProjectParticipant = {
    userId: number;
    username: string;
    projectRoleId: EProjectAccessRole;
    projectRole: string;
};

export type TProject = {
    projectId: number;
    name: string;
    description: string;
    participantsAmount: number;
    tagsAmount: number;
    dateStart: string | null;
    dateEnd: string | null;
    tags: TTag[];
    participants: TProjectParticipant[];
};

export type TProjectId = Pick<TProject, 'projectId'>;
