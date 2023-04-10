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
                userId: { type: 'number' },
                name: { type: 'string', nullable: true },
                email: { type: 'string', nullable: true },
                username: { type: 'string', nullable: true },
                password: { type: 'string', nullable: true },
                about: { type: 'string', nullable: true },
                group: { type: 'string', nullable: true }
            },
            required: ['userId'],
            additionalProperties: false
        }
    },
    required: ['user'],
    additionalProperties: false
};
