import { query } from 'express-validator';

import { creationPureSchema, creationSchema } from './creationSchema';
import { editPureSchema, editSchema } from './editSchema';

import { TSchemas } from '@type/schema';

export const QUESTION_SCHEMA: TSchemas = {
    creationSchema,
    creationPureSchema,
    editSchema,
    editPureSchema
} as const;

export const QUESTION_QUERY = {
    questionIds: query('questionIds', 'questionIds must be an array of numbers >= 1')
        .optional()
        .isArray()
        .custom((questionIds: any[]) => questionIds.every((elem) => !isNaN(elem) && elem >= 1))
} as const;
