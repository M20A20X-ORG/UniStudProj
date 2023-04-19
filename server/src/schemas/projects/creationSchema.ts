import { JSONSchemaType } from 'ajv';
import { TProjectCreation, TProjectJson } from '@type/schemas/projects/project';

type TCreationSchema = JSONSchemaType<TProjectJson<TProjectCreation>>;

export const creationSchema: TCreationSchema = {
    $id: 'http://example.com/schemas/project/create',
    type: 'object',
    properties: {
        project: {
            type: 'object',
            properties: {
                name: { type: 'string', format: 'projectName' },
                description: { type: 'string', nullable: true },
                dateStart: { type: 'string' },
                dateEnd: { type: 'string' },
                tagIds: {
                    type: 'array',
                    items: { type: 'integer', minimum: 1 } as any,
                    minItems: 0,
                    maxItems: 50
                },
                participantIds: {
                    type: 'array',
                    items: { $ref: '/schemas/project/participantIds' } as any,
                    minItems: 0,
                    maxItems: 50
                }
            },
            additionalProperties: false,
            required: ['name', 'dateStart', 'dateEnd', 'tagIds']
        }
    },
    additionalProperties: false,
    required: ['project']
};
