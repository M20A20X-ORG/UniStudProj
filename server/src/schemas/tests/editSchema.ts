import { JSONSchemaType } from 'ajv';
import { TTestEdit, TTestJson } from '@type/schemas/tests/test';

type TEditSchema = JSONSchemaType<TTestJson<TTestEdit>>;

export const editSchema: TEditSchema = {
    $id: 'http://example.com/schemas/test/edit',
    type: 'object',
    properties: {
        test: {
            type: 'object',
            properties: {
                testId: { type: 'integer', minimum: 1 },
                projectId: { type: 'integer', minimum: 1 },
                name: { type: 'string', format: 'testName', nullable: true },
                timeLimit: { type: 'integer', minimum: 30, nullable: true },
                dateStart: { type: 'string', nullable: true },
                dateEnd: { type: 'string', nullable: true },
                questionId: {
                    type: 'array',
                    items: { type: 'integer', minimum: 1 } as any,
                    minItems: 0,
                    maxItems: 50,
                    nullable: true
                },
                newQuestions: {
                    type: 'array',
                    items: { $ref: '/schemas/test/question/creation-pure' } as any,
                    minItems: 0,
                    maxItems: 50,
                    nullable: true
                },
                editedQuestions: {
                    type: 'array',
                    items: { $ref: '/schemas/test/question/edit-pure' } as any,
                    minItems: 0,
                    maxItems: 50,
                    nullable: true
                },
                deleteQuestionIds: {
                    type: 'array',
                    items: { type: 'integer', minimum: 1 } as any,
                    minItems: 0,
                    maxItems: 50,
                    nullable: true
                }
            },
            additionalProperties: false,
            required: ['testId', 'projectId']
        }
    },
    additionalProperties: false,
    required: ['test']
};
