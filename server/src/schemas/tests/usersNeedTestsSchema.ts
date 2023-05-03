import { JSONSchemaType } from 'ajv';
import { TTestsJson, TUserNeedTest } from '@type/schemas/tests/test';

type TUserNeedTestPureSchema = JSONSchemaType<TUserNeedTest>;
type TUserNeedTestSchema = JSONSchemaType<TTestsJson<TUserNeedTest>>;
type TUsersNeedTestsSchema = JSONSchemaType<TTestsJson<Array<TUserNeedTest>>>;

export const userNeedTestPureSchema: TUserNeedTestPureSchema = {
    $id: 'http://example.com/schemas/test/user-need-test-pure',
    type: 'object',
    properties: {
        testId: { type: 'integer', minimum: 1 },
        userId: { type: 'integer', minimum: 1 },
        projectId: { type: 'integer', minimum: 1 }
    },
    additionalProperties: false,
    required: ['userId', 'projectId', 'testId']
};

export const userNeedTestSchema: TUserNeedTestSchema = {
    $id: 'http://example.com/schemas/test/user-need-test',
    type: 'object',
    properties: { tests: { $ref: '/schemas/test/user-need-test-pure' } },
    additionalProperties: false,
    required: ['tests']
};

export const usersNeedTestsSchema: TUsersNeedTestsSchema = {
    $id: 'http://example.com/schemas/test/users-need-tests',
    type: 'object',
    properties: {
        tests: {
            type: 'array',
            items: { $ref: '/schemas/test/user-need-test-pure' } as any,
            minItems: 0,
            maxItems: 50
        }
    },
    additionalProperties: false,
    required: ['tests']
};
