import { JSONSchemaType } from 'ajv';
import { TProjectParticipantId } from '@type/schemas/projects/project';

type TProjectParticipantIds = JSONSchemaType<TProjectParticipantId>;
export const participantIdsSchema: TProjectParticipantIds = {
    $id: 'http://example.com/schemas/project/participantIds',
    type: 'object',
    properties: {
        userId: { type: 'integer', minimum: 1 },
        projectRoleId: { type: 'integer', minimum: 1 }
    },
    additionalProperties: false,
    required: ['userId', 'projectRoleId']
};
