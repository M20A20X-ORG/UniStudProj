import { TTag } from 'types/rest/responses/tag';

export enum EProjectRole {
    PROJECT_ROLE_OWNER = 1,
    PROJECT_ROLE_MANAGER,
    PROJECT_ROLE_MENTOR,
    PROJECT_ROLE_DEVELOPER
}

export type TProjectParticipant = {
    userId: number;
    username: string;
    projectRoleId: EProjectRole;
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
