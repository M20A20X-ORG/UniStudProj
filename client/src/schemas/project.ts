import { JSONSchemaType } from 'ajv';
import { TProject } from 'types/rest/responses/project';

type TProjectSchema = Omit<TProject, 'dateStart' | 'dateEnd'> & { dateStart?: string; dateEnd?: string };

export const projectSchema: JSONSchemaType<TProjectSchema> = {
    $id: 'http://example.com/schema/project',
    type: 'object',
    properties: {
        projectId: { type: 'integer' },
        name: { type: 'string' },
        description: { type: 'string' },
        participantsAmount: { type: 'integer' },
        tagsAmount: { type: 'integer' },
        dateStart: { type: 'string', nullable: true },
        dateEnd: { type: 'string', nullable: true },
        tags: {
            type: 'array',
            items: { $ref: '/schema/tag' } as any,
            minItems: 0,
            maxItems: 1000
        },
        participants: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    userId: { type: 'integer' },
                    projectRoleId: { type: 'integer' },
                    username: { type: 'string' },
                    projectRole: { type: 'string' }
                },
                additionalProperties: false,
                required: ['userId', 'projectRoleId', 'username', 'projectRole']
            } as any,
            minItems: 0,
            maxItems: 1000
        }
    },
    required: ['projectId', 'name', 'participantsAmount', 'description', 'tagsAmount', 'tags', 'participants'],
    additionalProperties: false
};
