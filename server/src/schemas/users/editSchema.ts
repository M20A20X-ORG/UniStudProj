import { JSONSchemaType } from 'ajv';
import { TUserJson, TUserPartial } from '@type/schemas/user';

type TEditSchema = JSONSchemaType<TUserJson<TUserPartial>>;

export const editSchema: TEditSchema = {
    $id: 'http://example.com/schemas/user/edit',
    type: 'object',
    properties: {
        user: {
            type: 'object',
            properties: {
                userId: { type: 'number', minimum: 0 },
                name: { type: 'string', nullable: true, format: 'userFullName', maxLength: 30 },
                email: { type: 'string', nullable: true, format: 'userEmail', maxLength: 30 },
                username: {
                    type: 'string',
                    nullable: true,
                    format: 'userUsername',
                    minLength: 6,
                    maxLength: 30
                },
                password: {
                    type: 'string',
                    nullable: true,
                    format: 'userPassword',
                    minLength: 6,
                    maxLength: 60
                },
                passwordConfirm: {
                    type: 'string',
                    nullable: true,
                    format: 'userPassword',
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
