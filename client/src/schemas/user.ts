import { JSONSchemaType } from 'ajv';
import { TUser } from 'types/rest/responses/auth';

export const userSchema: JSONSchemaType<TUser> = {
    $id: 'http://example.com/schema/user',
    type: 'object',
    properties: {
        userId: { type: 'number' },
        role: { type: 'string' },
        name: { type: 'string' },
        imgUrl: { type: 'string' },
        email: { type: 'string' },
        username: {
            type: 'string'
        },
        about: { type: 'string' },
        group: { type: 'string' }
    },
    required: ['userId', 'role', 'email', 'imgUrl', 'name', 'username', 'group'],
    additionalProperties: false
};
