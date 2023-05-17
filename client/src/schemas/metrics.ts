import { JSONSchemaType } from 'ajv';
import { TMetrics } from 'types/rest/responses/metrics';

export const metricsSchema: JSONSchemaType<TMetrics> = {
    $id: 'http://example.com/schema/metrics',
    type: 'object',
    properties: {
        allTimeGuests: { type: 'integer' },
        allUsers: { type: 'integer' },
        allProjects: { type: 'integer' },
        allTasksCompleted: { type: 'integer' }
    },
    required: ['allTimeGuests', 'allUsers', 'allProjects', 'allTasksCompleted'],
    additionalProperties: false
};
