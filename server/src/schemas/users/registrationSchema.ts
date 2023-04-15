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
                name: { type: 'string', format: 'fullname', maxLength: 30 },
                email: { type: 'string', format: 'email', maxLength: 30 },
                username: {
                    type: 'string',
                    format: 'username',
                    minLength: 6,
                    maxLength: 30
                },
                password: {
                    type: 'string',
                    format: 'password',
                    minLength: 6,
                    maxLength: 60
                },
                passwordConfirm: {
                    type: 'string',
                    format: 'password',
                    minLength: 6,
                    maxLength: 60
                },
                about: { type: 'string', nullable: true, maxLength: 200 },
                group: { type: 'string', maxLength: 30 }
            },
            required: ['name', 'email', 'password', 'username', 'passwordConfirm', 'group'],
            additionalProperties: false
        }
    },
    required: ['user'],
    additionalProperties: false
};
