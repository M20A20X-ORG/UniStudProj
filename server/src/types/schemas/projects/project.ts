export type TProjectParticipant = {
    userId: number;
    username: string;
    projectRoleId: number;
    projectRole: string;
};
export type TProjectTag = {
    tagId: number;
    tag: string;
};

export type TProject = {
    projectId: number;
    name: string;
    description?: string;
    participantsAmount: number;
    tagsAmount: number;
    dateStart: string;
    dateEnd: string;
    tags: TProjectTag[];
    participants: TProjectParticipant[];
};

export type TProjectJson<T> = { project: T };

export type TProjectId = Pick<TProject, 'projectId'>;
export type TProjectParticipantId = Pick<TProjectParticipant, 'userId' | 'projectRoleId'>;
export type TProjectCreation = Pick<TProject, 'name' | 'description' | 'dateStart' | 'dateEnd'> & {
    tagIds: Array<number>;
    participantIds: Array<TProjectParticipantId>;
};
export type TProjectEdit = Pick<TProject, 'projectId'> &
    Partial<
        TProjectCreation & {
            deleteParticipantIds: Array<number>;
            deleteTagIds: Array<number>;
        }
    >;
