import { JSONSchemaType } from 'ajv';
import { TTestCreation, TTestsJson } from '@type/schemas/tests/test';

type TCreationPureSchema = JSONSchemaType<TTestCreation>;
type TCreationSchema = JSONSchemaType<TTestsJson<Array<TTestCreation>>>;

export const creationPureSchema: TCreationPureSchema = {
    $id: 'http://example.com/schemas/test/creation-pure',
    type: 'object',
    properties: {
        name: { type: 'string', format: 'testName' },
        projectId: { type: 'integer', minimum: 1 },
        timeLimit: { type: 'integer', minimum: 30 },
        dateStart: { type: 'string' },
        dateEnd: { type: 'string' },
        passingScore: { type: 'number', minimum: 0 },
        questionIds: {
            type: 'array',
            items: { type: 'integer', minimum: 1 } as any,
            minItems: 0,
            maxItems: 50
        }
    },
    additionalProperties: false,
    required: ['projectId', 'name', 'dateStart', 'dateEnd', 'passingScore', 'questionIds']
};

export const creationSchema: TCreationSchema = {
    $id: 'http://example.com/schemas/test/creation',
    type: 'object',
    properties: {
        tests: {
            type: 'array',
            items: { $ref: '/schemas/test/creation-pure' } as any,
            minItems: 0,
            maxItems: 50
        }
    },
    additionalProperties: false,
    required: ['tests']
};
