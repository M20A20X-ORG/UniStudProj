import { JSONSchemaType } from 'ajv';
import { TTaskStatus } from 'types/rest/responses/projectTask';

type TTaskStatusSchema = JSONSchemaType<TTaskStatus>;

export const projectTaskStatusSchema: TTaskStatusSchema = {
    $id: 'http://example.com/schema/project/task/status',
    type: 'object',
    properties: {
        statusId: { type: 'integer' },
        status: { type: 'string' }
    },
    required: ['statusId', 'status'],
    additionalProperties: false
};
