import { JSONSchemaType } from 'ajv';
import { TUserJson, TUserPartial } from '@type/schemas/user';

type TEditSchema = JSONSchemaType<TUserJson<TUserPartial>>;

export const editSchema: TEditSchema = {
    $id: 'UserEditSchema',
    type: 'object',
    properties: {
        user: {
            type: 'object',
            properties: {
                userId: { type: 'number', minimum: 0 },
                name: { type: 'string', nullable: true, format: 'fullname', maxLength: 30 },
                email: { type: 'string', nullable: true, format: 'email', maxLength: 30 },
                username: {
                    type: 'string',
                    nullable: true,
                    format: 'username',
                    minLength: 6,
                    maxLength: 30
                },
                password: {
                    type: 'string',
                    nullable: true,
                    format: 'password',
                    minLength: 6,
                    maxLength: 60
                },
                passwordConfirm: {
                    type: 'string',
                    nullable: true,
                    format: 'password',
                    minLength: 6,
                    maxLength: 60
                },
                about: { type: 'string', nullable: true, maxLength: 200 },
                group: { type: 'string', nullable: true, maxLength: 30 }
            },
            required: ['userId'],
            additionalProperties: false
        }
    },
    required: ['user'],
    additionalProperties: false
};
