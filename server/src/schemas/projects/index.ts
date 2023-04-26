import { query } from 'express-validator';

import { participantIdsSchema } from './participantIdsSchema';
import { creationSchema } from './creationSchema';
import { editSchema } from './editSchema';

import { TSchemaFormats, TSchemas } from '@type/schema';

export const PROJECT_SCHEMA: TSchemas = {
    participantIdsSchema,
    creationSchema,
    editSchema
} as const;

export const PROJECT_FORMATS: TSchemaFormats = {
    projectName: /^[A-Z\d][a-z\d]{5,}$/i
} as const;

export const PROJECT_QUERY = {
    projectId: query('projectId', 'projectId must be a number >= 1').isInt(),
    projectIds: query('projectIds', 'projectIds must be an array of numbers >= 1')
        .isArray()
        .custom((projectIds: any[]) => projectIds.every((elem) => !isNaN(elem) && elem >= 1))
} as const;
