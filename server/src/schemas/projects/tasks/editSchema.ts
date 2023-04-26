import { JSONSchemaType } from 'ajv';
import { TTaskJson, TTaskEdit } from '@type/schemas/projects/tasks';

type TEditSchema = JSONSchemaType<TTaskJson<TTaskEdit>>;

export const editSchema: TEditSchema = {
    $id: 'http://example.com/schemas/project/task/edit',
    type: 'object',
    properties: {
        task: {
            type: 'object',
            properties: {
                taskId: { type: 'number', minimum: 1 },
                projectId: { type: 'number', minimum: 1 },
                name: { type: 'string', format: 'taskName', nullable: true },
                description: { type: 'string', nullable: true },
                statusId: { type: 'number', nullable: true },
                assignUserId: { type: 'number', minimum: 1, nullable: true },
                tagIds: {
                    type: 'array',
                    items: { type: 'integer', minimum: 1 } as any,
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
                }
            },
            additionalProperties: false,
            required: ['taskId', 'projectId']
        }
    },
    additionalProperties: false,
    required: ['task']
};
