import { check } from 'express-validator';

import { registrationSchema } from './registrationSchema';
import { editSchema } from './editSchema';

import { TSchema } from '@type/schema';

export const USER_SCHEMA: TSchema = {
    registrationSchema,
    editSchema
};

export const USER_FORMAT = {
    userFullName: /^([A-Z][a-z]+\s?){3,}$/i,
    userUsername: /^[a-z\d]{5,}$/,
    userPassword: /^[\w\W]{6,}$/,
    userEmail: /^[a-z\d]+@[a-z\d]+.[a-z\d]+$/
};

export const USER_QUERY = {
    userIdentifiers: check(
        'userIdentifiers',
        `userIdentifiers must be an array of numbers >= 1 or strings with pattern ${USER_FORMAT.userUsername}}`
    )
        .isArray()
        .custom((id) => !isNaN(id) || USER_FORMAT.userUsername.test(id))
};
