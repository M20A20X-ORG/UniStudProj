import { JSONSchemaType } from 'ajv';
import { TLogin } from 'types/rest/responses/auth';

export const userLoginSchema: JSONSchemaType<TLogin> = {
    $id: 'http://example.com/schema/user/login',
    type: 'object',
    properties: {
        userId: { type: 'number' },
        role: { type: 'string' },
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' }
    },
    required: ['userId', 'role', 'accessToken', 'refreshToken'],
    additionalProperties: false
};
