import { check } from 'express-validator';

import { participantIdsSchema } from './participantIdsSchema';
import { creationSchema } from './creationSchema';
import { editSchema } from './editSchema';

import { TSchemas } from '@type/schema';
import { RequestParamsError } from '@exceptions/RequestParamsError';

export const PROJECT_SCHEMA: TSchemas = {
    participantIdsSchema,
    creationSchema,
    editSchema
};

export const PROJECT_QUERY = {
    projectId: check('projectId', new RequestParamsError('projectId must be >= 1').message).isInt({
        min: 1
    })
};
