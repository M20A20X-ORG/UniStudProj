import { check } from 'express-validator';

import { registrationSchema } from './registrationSchema';
import { editSchema } from './editSchema';

import { TQueryValidators, TSchemaFormats, TSchemas } from '@type/schema';
import { RequestParamsError } from '@exceptions/RequestParamsError';

export const USER_SCHEMA: TSchemas = {
    registrationSchema,
    editSchema
} as const;

export const USER_FORMAT: TSchemaFormats = {
    userFullName: /^([A-Z][a-z]+\s?){3,}$/i,
    userUsername: /^[a-z\d]{5,}$/,
    userPassword: /^[\w\W]{6,}$/,
    userEmail: /^[a-z\d]+@[a-z\d]+.[a-z\d]+$/
} as const;

export const USER_QUERY: TQueryValidators = {
    userId: check(
        'userIdentifier',
        new RequestParamsError(
            `userIdentifier must be number >= 1 or string with pattern ${USER_FORMAT.username}}`
        ).message
    )
        .isInt({ min: 1 })
        .isString()
} as const;
