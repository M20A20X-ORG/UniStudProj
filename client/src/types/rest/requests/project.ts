import { TProject } from 'types/rest/responses/project';
import { TProjectParticipant } from 'types/rest/responses/project';

export type TProjectJson<T> = { project: T };

export type TProjectParticipantId = Pick<TProjectParticipant, 'userId' | 'projectRoleId'>;

export type TProjectCreation = Pick<TProject, 'name' | 'description' | 'dateStart' | 'dateEnd'> & {
    newTagIds: Array<number>;
    newParticipantIds: Array<TProjectParticipantId>;
};
export type TProjectEdit = Pick<TProject, 'projectId'> &
    Partial<
        TProjectCreation & {
            deleteParticipantIds: Array<number>;
            deleteTagIds: Array<number>;
        }
    >;
