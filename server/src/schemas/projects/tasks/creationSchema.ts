import { JSONSchemaType } from 'ajv';
import { TTaskCreation, TTaskJson } from '@type/schemas/projects/tasks';

type TCreationSchema = JSONSchemaType<TTaskJson<TTaskCreation>>;

export const creationSchema: TCreationSchema = {
    $id: 'http://example.com/schemas/project/task/create',
    type: 'object',
    properties: {
        task: {
            type: 'object',
            properties: {
                name: { type: 'string', format: 'taskName' },
                description: { type: 'string', nullable: true },
                statusId: { type: 'number' },
                projectId: { type: 'number' },
                assignUserId: { type: 'number', minimum: 1 },
                tagIds: {
                    type: 'array',
                    items: { type: 'integer', minimum: 1 } as any,
                    minItems: 0,
                    maxItems: 50
                }
            },
            additionalProperties: false,
            required: ['name', 'projectId', 'statusId', 'assignUserId', 'tagIds']
        }
    },
    additionalProperties: false,
    required: ['task']
};
