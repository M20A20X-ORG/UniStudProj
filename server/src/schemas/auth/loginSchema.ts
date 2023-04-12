import { JSONSchemaType } from 'ajv';
import { TUserLogin } from '@type/schemas/auth';
import { TUserJson } from '@type/schemas/user';

type TLoginSchema = JSONSchemaType<TUserJson<TUserLogin>>;

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
