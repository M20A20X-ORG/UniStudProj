import { JSONSchemaType } from 'ajv';
import { TTestCompleted, TTestsJson } from '@type/schemas/tests/test';

type TUsersNeedTestsSchema = JSONSchemaType<TTestsJson<TTestCompleted>>;

export const testCompletedSchema: TUsersNeedTestsSchema = {
    $id: 'http://example.com/schemas/test/test-completed',
    type: 'object',
    properties: {
        tests: {
            type: 'object',
            properties: {
                testId: { type: 'integer', minimum: 1 },
                userId: { type: 'integer', minimum: 1 },
                projectId: { type: 'integer', minimum: 1 },
                answers: {
                    type: 'array',
                    items: { $ref: '/schemas/test/question/question-marked' } as any,
                    minItems: 0,
                    maxItems: 50
                },
                dateCompleted: { type: 'string' }
            },
            additionalProperties: false,
            required: ['testId', 'userId', 'projectId', 'answers', 'dateCompleted']
        }
    },
    additionalProperties: false,
    required: ['tests']
};
