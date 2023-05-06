import { check } from 'express-validator';

import { creationSchema } from './creationSchema';
import { editSchema } from './editSchema';

import { TSchema } from '@type/schema';

export const NEWS_SCHEMA: TSchema = {
    creationSchema,
    editSchema
};

export const NEWS_QUERY = {
    newsIds: check('newsIds', "'newsIds' must be an array of numbers >= 1")
        .isArray()
        .custom((newsIds: any[]) => newsIds.every((elem) => !isNaN(elem) && elem >= 1))
};
