import { JSONSchemaType } from 'ajv';
import { TUserJson, TUserRegistration } from '@type/schemas/user';

type TRegistrationSchema = JSONSchemaType<TUserJson<TUserRegistration>>;

export const registrationSchema: TRegistrationSchema = {
    $id: 'UserRegistrationSchema',
    type: 'object',
    properties: {
        user: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                email: { type: 'string' },
                password: { type: 'string' },
                username: { type: 'string' },
                about: { type: 'string', nullable: true },
                group: { type: 'string' }
            },
            required: ['name', 'email', 'password', 'username', 'group'],
            additionalProperties: false
        }
    },
    required: ['user'],
    additionalProperties: false
};
