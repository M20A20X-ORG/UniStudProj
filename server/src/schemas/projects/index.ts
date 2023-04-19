import { check } from 'express-validator';

import { participantIdsSchema } from './participantIdsSchema';
import { creationSchema } from './creationSchema';
import { editSchema } from './editSchema';

import { TSchemaFormats, TSchemas } from '@type/schema';
import { RequestParamsError } from '@exceptions/RequestParamsError';

export const PROJECT_SCHEMA: TSchemas = {
    participantIdsSchema,
    creationSchema,
    editSchema
} as const;

export const PROJECT_FORMATS: TSchemaFormats = {
    projectName: /^[A-Z\d][a-z\d]{5,}$/i
} as const;

export const PROJECT_QUERY = {
    projectId: check('projectId')
        .isInt()
        .withMessage(new RequestParamsError('projectId must be a number >= 1').message),
    projectIds: check('projectIds')
        .optional()
        .isArray()
        .custom((projectIds: any[]) => projectIds.every((elem) => !isNaN(elem) && elem >= 1))
        .withMessage(new RequestParamsError('projectIds must be an array of numbers >= 1').message)
} as const;
