export type TProjectParticipant = {
    userId: number;
    username: string;
    projectRoleId: number;
    projectRole: string;
};
export type TTag = {
    tagId: number;
    tag: string;
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

export type TProjectJson<T> = { project: T };

export type TProjectId = Pick<TProject, 'projectId'>;
export type TProjectParticipantId = Pick<TProjectParticipant, 'userId' | 'projectRoleId'>;
export type TProjectCreation = Pick<TProject, 'name' | 'description' | 'dateStart' | 'dateEnd'> & {
    newTagIds: Array<number>;
    newParticipantIds: Array<TProjectParticipantId>;
};
export type TProjectEdit = TProjectId &
    Partial<
        TProjectCreation & {
            deleteParticipantIds: Array<number>;
            deleteTagIds: Array<number>;
        }
    >;
