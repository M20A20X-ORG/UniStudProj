import { JSONSchemaType } from 'ajv';
import { TProjectTask } from 'types/rest/responses/projectTask';

type TProjectTaskSchema = JSONSchemaType<TProjectTask>;

export const projectTaskSchema: TProjectTaskSchema = {
    $id: 'http://example.com/schema/project/task',
    type: 'object',
    properties: {
        projectId: { type: 'integer' },
        taskId: { type: 'integer' },
        name: { type: 'string' },
        description: { type: 'string' },
        status: { $ref: '/schema/project/task/status' },
        assignUser: {
            type: 'object',
            properties: {
                userId: { type: 'integer' },
                username: { type: 'string' }
            },
            required: ['userId', 'username'],
            additionalProperties: false
        },
        tags: {
            type: 'array',
            items: { $ref: '/schema/tag' } as any,
            minItems: 0,
            maxItems: 1000
        }
    },
    required: ['projectId', 'taskId', 'name', 'description', 'status', 'assignUser', 'tags'],
    additionalProperties: false
};
