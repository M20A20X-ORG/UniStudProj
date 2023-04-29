import { query } from 'express-validator';

import { creationPureSchema, creationSchema } from './creationSchema';
import { editPureSchema, editSchema } from './editSchema';
import { optionSchema, optionSchemaEdit } from './optionSchema';

import { TSchemas } from '@type/schema';

export const QUESTION_SCHEMA: TSchemas = {
    creationSchema,
    creationPureSchema,
    editSchema,
    editPureSchema,
    optionSchema,
    optionSchemaEdit
} as const;

export const QUESTION_QUERY = {
    questionIds: query('questionIds', 'questionIds must be an array of numbers >= 1')
        .isArray()
        .custom((questionIds: any[]) => questionIds.every((elem) => !isNaN(elem) && elem >= 1))
} as const;
