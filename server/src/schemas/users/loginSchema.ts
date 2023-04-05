import { JSONSchemaType } from 'ajv';
import { TUserAuth } from '@type/schemas/user';

type TLoginSchema = JSONSchemaType<{ user: TUserAuth }>;

export const loginSchema: TLoginSchema = {
    $id: 'UserLoginSchema',
    type: 'object',
    properties: {
        user: {
            type: 'object',
            properties: {
                username: { type: 'string' },
                password: { type: 'string' }
            },
            required: ['username', 'password'],
            additionalProperties: false
        }
    },
    required: ['user'],
    additionalProperties: false
};
