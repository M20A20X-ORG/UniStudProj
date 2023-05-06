import { query } from 'express-validator';

import { creationPureSchema, creationSchema } from './creationSchema';
import { editPureSchema, editSchema } from './editSchema';
import { optionSchema, optionSchemaEdit } from './optionSchema';
import { questionMarkedSchema } from './questionMarkedSchema';

import { TSchema } from '@type/schema';

export const QUESTION_SCHEMA: TSchema = {
    creationSchema,
    creationPureSchema,
    editSchema,
    editPureSchema,
    optionSchema,
    optionSchemaEdit,
    questionMarkedSchema
};

export const QUESTION_QUERY = {
    questionIds: query('questionIds', 'questionIds must be an array of numbers >= 1')
        .isArray()
        .custom((questionIds: any[]) => questionIds.every((elem) => !isNaN(elem) && elem >= 1)),
    needResults: query('needResults', 'needResults must be a boolean').isBoolean()
};
