import { JSONSchemaType } from 'ajv';
import { TProjectEdit, TProjectJson } from '@type/schemas/projects/project';

type TEditSchema = JSONSchemaType<TProjectJson<TProjectEdit>>;

export const editSchema: TEditSchema = {
    $id: 'http://example.com/schemas/project/edit',
    type: 'object',
    properties: {
        project: {
            type: 'object',
            properties: {
                projectId: { type: 'number' },
                name: { type: 'string', format: 'projectName', nullable: true },
                description: { type: 'string', nullable: true },
                dateStart: { type: 'string', nullable: true },
                dateEnd: { type: 'string', nullable: true },
                tagIds: {
                    type: 'array',
                    items: { type: 'integer' } as any,
                    minItems: 0,
                    maxItems: 50,
                    nullable: true
                },
                deleteTagIds: {
                    type: 'array',
                    items: { type: 'integer', minimum: 1 } as any,
                    minItems: 0,
                    maxItems: 50,
                    nullable: true
                },
                participantIds: {
                    type: 'array',
                    items: { $ref: '/schemas/project/participantIds' } as any,
                    minItems: 0,
                    maxItems: 50,
                    nullable: true
                },
                deleteParticipantIds: {
                    type: 'array',
                    items: { type: 'integer', minimum: 1 } as any,
                    minItems: 0,
                    maxItems: 50,
                    nullable: true
                }
            },
            required: ['projectId'],
            additionalProperties: false
        }
    },
    required: ['project'],
    additionalProperties: false
};
