import { JSONSchemaType } from 'ajv';
import { TUserJson, TUserRegistration } from '@type/schemas/user';

type TRegistrationSchemaNull = Omit<TUserRegistration, 'imgUrl'> & {
    imgUrl?: string;
};

type TRegistrationSchema = JSONSchemaType<TUserJson<TRegistrationSchemaNull>>;

export const registrationSchema: TRegistrationSchema = {
    $id: 'http://example.com/schemas/user/registration',
    type: 'object',
    properties: {
        user: {
            type: 'object',
            properties: {
                name: { type: 'string', format: 'userFullName', maxLength: 30 },
                email: { type: 'string', format: 'userEmail', maxLength: 30 },
                imgUrl: { type: 'string', maxLength: 200, nullable: true },
                username: {
                    type: 'string',
                    format: 'userUsername',
                    minLength: 6,
                    maxLength: 30
                },
                password: {
                    type: 'string',
                    format: 'userPassword',
                    minLength: 6,
                    maxLength: 60
                },
                passwordConfirm: {
                    type: 'string',
                    format: 'userPassword',
                    minLength: 6,
                    maxLength: 60
                },
                about: { type: 'string', maxLength: 200 },
                group: { type: 'string', maxLength: 30 }
            },
            required: [
                'name',
                'email',
                'password',
                'username',
                'about',
                'passwordConfirm',
                'group'
            ],
            additionalProperties: false
        }
    },
    required: ['user'],
    additionalProperties: false
};
