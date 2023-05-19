import { JSONSchemaType } from 'ajv';
import { TUserLogin } from '@type/schemas/auth';
import { TUserJson } from '@type/schemas/user';

type TLoginSchema = JSONSchemaType<TUserJson<TUserLogin>>;

export const loginSchema: TLoginSchema = {
    $id: 'http://example.com/schemas/auth/login',
    type: 'object',
    properties: {
        user: {
            type: 'object',
            properties: {
                username: { type: 'string', format: 'userUsername' },
                password: { type: 'string', format: 'userPassword' }
            },
            required: ['username', 'password'],
            additionalProperties: false
        }
    },
    required: ['user'],
    additionalProperties: false
};
