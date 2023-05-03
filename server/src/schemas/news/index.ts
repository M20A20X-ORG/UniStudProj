import { check } from 'express-validator';

import { creationSchema } from './creationSchema';
import { editSchema } from './editSchema';

import { TSchemas } from '@type/schema';

export const NEWS_SCHEMA: TSchemas = {
    creationSchema,
    editSchema
} as const;

export const NEWS_QUERY = {
    newsIds: check('newsIds', "'newsIds' must be an array of numbers >= 1")
        .isArray()
        .custom((newsIds: any[]) => newsIds.every((elem) => !isNaN(elem) && elem >= 1))
} as const;
