import { JSONSchemaType } from 'ajv';
import { TProjectCreation, TProjectJson } from '@type/schemas/projects/project';

type TCreationSchema = Omit<TProjectCreation, 'dateStart' | 'dateEnd'> & {
    dateStart?: string;
    dateEnd?: string;
};

export const creationSchema: JSONSchemaType<TProjectJson<TCreationSchema>> = {
    $id: 'http://example.com/schemas/project/create',
    type: 'object',
    properties: {
        project: {
            type: 'object',
            properties: {
                name: { type: 'string', format: 'projectName' },
                description: { type: 'string' },
                dateStart: { type: 'string', nullable: true },
                dateEnd: { type: 'string', nullable: true },
                newTagIds: {
                    type: 'array',
                    items: { type: 'integer', minimum: 1 } as any,
                    minItems: 0,
                    maxItems: 50
                },
                newParticipantIds: {
                    type: 'array',
                    items: { $ref: '/schemas/project/participantIds' } as any,
                    minItems: 0,
                    maxItems: 50
                }
            },
            additionalProperties: false,
            required: ['name', 'description', 'newTagIds']
        }
    },
    additionalProperties: false,
    required: ['project']
};
