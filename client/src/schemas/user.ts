import { JSONSchemaType } from 'ajv';
import { TUser } from 'types/rest/responses/auth';

type TUserSchemaNull = Omit<TUser, 'imgUrl'> & {
    imgUrl?: string
}

export const userSchema: JSONSchemaType<TUserSchemaNull> = {
    $id: 'http://example.com/schema/user',
    type: 'object',
    properties: {
        userId: { type: 'number' },
        role: { type: 'string' },
        name: { type: 'string' },
        imgUrl: { type: 'string', nullable: true },
        email: { type: 'string' },
        username: {
            type: 'string'
        },
        about: { type: 'string' },
        group: { type: 'string' }
    },
    required: ['userId', 'role', 'email', 'name', 'username', 'group'],
    additionalProperties: false
};
