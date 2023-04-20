import { check } from 'express-validator';

import { creationSchema } from './creationSchema';
import { editSchema } from './editSchema';

import { PROJECT_FORMATS } from '@schemas/projects';

import { TSchemaFormats, TSchemas } from '@type/schema';

export const TASK_SCHEMA: TSchemas = {
    creationSchema,
    editSchema
} as const;

export const TASK_FORMATS: TSchemaFormats = {
    taskName: PROJECT_FORMATS.projectName
} as const;

export const TASK_QUERY = {
    status: check('status', 'status must be a string').isString(),
    taskId: check('taskId', 'taskId must be a number >= 1').isInt()
} as const;
