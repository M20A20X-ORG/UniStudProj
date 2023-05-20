import { query } from 'express-validator';

import { participantIdsSchema } from './participantIdsSchema';
import { creationSchema } from './creationSchema';
import { editSchema } from './editSchema';

import { TSchema } from '@type/schema';

export const PROJECT_SCHEMA: TSchema = {
    participantIdsSchema,
    creationSchema,
    editSchema
};

export const PROJECT_FORMATS = {
    projectName: /^[A-Z\d][a-z\d]{5,}$/i
};

export const PROJECT_QUERY = {
    projectId: query('projectId', 'projectId must be a number >= 1').isInt(),
    projectIds: query('projectIds', 'projectIds must be an array of numbers >= 1')
        .optional()
        .isArray()
        .custom((elem: any) => !isNaN(elem) && elem >= 1)
};
