import { JSONSchemaType } from 'ajv';
import { TTestEdit, TTestsJson } from '@type/schemas/tests/test';

type TEditPureSchema = JSONSchemaType<TTestEdit>;
type TEditSchema = JSONSchemaType<TTestsJson<Array<TTestEdit>>>;

export const editPureSchema: TEditPureSchema = {
    $id: 'http://example.com/schemas/test/edit-pure',
    type: 'object',
    properties: {
        testId: { type: 'integer', minimum: 1 },
        projectId: { type: 'integer', minimum: 1 },
        name: { type: 'string', format: 'testName', nullable: true },
        timeLimit: { type: 'integer', minimum: 30, nullable: true },
        dateStart: { type: 'string', nullable: true },
        dateEnd: { type: 'string', nullable: true },
        questionIds: {
            type: 'array',
            items: { type: 'integer', minimum: 1 } as any,
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
};

export const editSchema: TEditSchema = {
    $id: 'http://example.com/schemas/test/edit',
    type: 'object',
    properties: {
        tests: {
            type: 'array',
            items: { $ref: '/schemas/test/edit-pure' } as any,
            minItems: 0,
            maxItems: 50
        }
    },
    additionalProperties: false,
    required: ['tests']
};
