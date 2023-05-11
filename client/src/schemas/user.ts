import { JSONSchemaType } from 'ajv';
import { TUser } from 'types/schemas/auth';

export const userSchema: JSONSchemaType<TUser> = {
    $id: 'http://example.com/schema/user',
    type: 'object',
    properties: {
        userId: { type: 'number', minimum: 1 },
        role: { type: 'string', maxLength: 30 },
        name: { type: 'string', format: 'userFullName', maxLength: 30 },
        email: { type: 'string', format: 'userEmail', maxLength: 30 },
        username: {
            type: 'string',
            format: 'userUsername',
            minLength: 6,
            maxLength: 30
        },
        about: { type: 'string', nullable: true, maxLength: 200 },
        group: { type: 'string', maxLength: 30 }
    },
    required: ['userId', 'role', 'email', 'name', 'username', 'group']
};

export const USER_FORMAT = {
    userFullName: /^([A-Z][a-z]+\s?){3,}$/i,
    userUsername: /^[a-z\d]{5,}$/,
    userEmail: /^[a-z\d]+@[a-z\d]+.[a-z\d]+$/
};
