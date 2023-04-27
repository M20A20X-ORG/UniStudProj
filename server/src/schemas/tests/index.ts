import { query } from 'express-validator';

import { optionSchema } from './question/optionSchema';
import { creationSchema } from './creationSchema';
import { editSchema } from './editSchema';

import { TSchemaFormats, TSchemas } from '@type/schema';
import { PROJECT_FORMATS } from '@schemas/projects';

export const TEST_SCHEMA: TSchemas = {
    optionSchema,
    creationSchema,
    editSchema
} as const;

export const TEST_FORMAT: TSchemaFormats = {
    testName: PROJECT_FORMATS.projectName
} as const;

export const TEST_QUERY = {
    testId: query('testId', 'testId must be a number >= 1').isInt(),
    testIds: query('testIds', 'testIds must be an array of numbers >= 1')
        .optional()
        .isArray()
        .custom((testIds: any[]) => testIds.every((elem) => !isNaN(elem) && elem >= 1))
} as const;
