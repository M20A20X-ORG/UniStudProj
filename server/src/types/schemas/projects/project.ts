export type TProjectParticipant = { username: string; projectRole: string };
export type TProjectParticipantId = { userId: number; projectRoleId: number };

export type TProject = {
    projectId: number;
    name: string;
    description?: string;
    participantsAmount: number;
    dateStart: string;
    dateEnd: string;
    tags: string[];
    participants: TProjectParticipant[];
};

export type TProjectJson<T> = { project: T };

export type TProjectCreation = Pick<TProject, 'name' | 'description' | 'dateStart' | 'dateEnd'> & {
    tagIds: Array<number>;
    participantIds: Array<TProjectParticipantId>;
};
export type TProjectPartial = Pick<TProject, 'projectId'> & Partial<TProjectCreation>;
