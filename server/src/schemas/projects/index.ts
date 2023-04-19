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
    projectId: check('projectId', new RequestParamsError('projectId must be >= 1').message).isInt({
        min: 1
    })
} as const;
