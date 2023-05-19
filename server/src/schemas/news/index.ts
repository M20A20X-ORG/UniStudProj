import { check } from 'express-validator';

import { creationSchema } from './creationSchema';
import { editSchema } from './editSchema';

import { TSchema } from '@type/schema';

export const NEWS_SCHEMA: TSchema = {
    creationSchema,
    editSchema
};

export const NEWS_QUERY = {
    newsId: check('newsId', "'newsId' must be a number >= 1").isInt({ min: 1 })
};
