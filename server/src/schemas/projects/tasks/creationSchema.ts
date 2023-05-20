import { JSONSchemaType } from 'ajv';
import { TTaskCreation, TTaskJson } from '@type/schemas/projects/tasks';

type TTaskCreationNulls = Omit<TTaskCreation, 'assignUserId' | 'statusId'> & {
    assignUserId?: number;
    statusId?: number;
};
type TCreationSchema = JSONSchemaType<TTaskJson<TTaskCreationNulls>>;

export const creationSchema: TCreationSchema = {
    $id: 'http://example.com/schemas/project/task/create',
    type: 'object',
    properties: {
        task: {
            type: 'object',
            properties: {
                name: { type: 'string', format: 'taskName' },
                description: { type: 'string' },
                statusId: { type: 'number', nullable: true },
                projectId: { type: 'number' },
                assignUserId: { type: 'number', minimum: 1, nullable: true },
                newTagIds: {
                    type: 'array',
                    items: { type: 'integer', minimum: 1 } as any,
                    minItems: 0,
                    maxItems: 50
                }
            },
            additionalProperties: false,
            required: ['name', 'projectId', 'description', 'newTagIds']
        }
    },
    additionalProperties: false,
    required: ['task']
};
