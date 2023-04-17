import { check } from 'express-validator';

import { registrationSchema } from './registrationSchema';
import { editSchema } from './editSchema';

import { TSchemas } from '@type/schema';
import { RequestParamsError } from '@exceptions/RequestParamsError';

export const USER_SCHEMA: TSchemas = {
    registrationSchema,
    editSchema
};

export const USER_QUERY = {
    userId: check('userId', new RequestParamsError('userId must be >= 1').message).isInt({ min: 1 })
};
