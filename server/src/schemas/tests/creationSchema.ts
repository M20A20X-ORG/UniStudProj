import { JSONSchemaType } from 'ajv';
import { TTestCreation, TTestJson } from '@type/schemas/tests/test';

type TCreationSchema = JSONSchemaType<TTestJson<TTestCreation>>;

export const creationSchema: TCreationSchema = {
    $id: 'http://example.com/schemas/test/create',
    type: 'object',
    properties: {
        test: {
            type: 'object',
            properties: {
                name: { type: 'string', format: 'testName' },
                projectId: { type: 'integer', minimum: 1 },
                timeLimit: { type: 'integer', minimum: 30 },
                dateStart: { type: 'string' },
                dateEnd: { type: 'string' },
                questionId: {
                    type: 'array',
                    items: { type: 'integer', minimum: 1 } as any,
                    minItems: 0,
                    maxItems: 50,
                    nullable: true
                },
                newQuestions: {
                    type: 'array',
                    items: { $ref: '/schemas/project/task/question/creation-pure' } as any,
                    minItems: 0,
                    maxItems: 50,
                    nullable: true
                }
            },
            additionalProperties: false,
            required: ['projectId', 'name', 'dateStart', 'dateEnd']
        }
    },
    additionalProperties: false,
    required: ['test']
};
