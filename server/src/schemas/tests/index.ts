import { query } from 'express-validator';

import { creationPureSchema, creationSchema } from './creationSchema';
import { editPureSchema, editSchema } from './editSchema';
import { testCompletedSchema } from './testCompletedSchema';
import {
    userNeedTestPureSchema,
    userNeedTestSchema,
    usersNeedTestsSchema
} from './usersNeedTestsSchema';

import { TSchemaFormats, TSchemas } from '@type/schema';

import { PROJECT_FORMATS } from '@schemas/projects';

export const TEST_SCHEMA: TSchemas = {
    creationPureSchema,
    creationSchema,
    editPureSchema,
    editSchema,
    userNeedTestPureSchema,
    userNeedTestSchema,
    usersNeedTestsSchema,
    testCompletedSchema
} as const;

export const TEST_FORMAT: TSchemaFormats = {
    testName: PROJECT_FORMATS.projectName
} as const;

export const TEST_QUERY = {
    testIds: query('testIds', "'testIds' must be an array of numbers >= 1")
        .optional()
        .isArray()
        .custom((testIds: any[]) => testIds.every((elem) => !isNaN(elem) && elem >= 1)),
    needCommonDataOnly: query('needCommonDataOnly', "'needCommonDataOnly' must be boolean value")
        .optional()
        .isBoolean()
} as const;
