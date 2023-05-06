import { check } from 'express-validator';

import { creationSchema } from './creationSchema';
import { editSchema } from './editSchema';

import { PROJECT_FORMATS } from '@schemas/projects';

import { TSchema } from '@type/schema';

export const TASK_SCHEMA: TSchema = {
    creationSchema,
    editSchema
};

export const TASK_FORMATS = {
    taskName: PROJECT_FORMATS.projectName
};

export const TASK_QUERY = {
    status: check('status', 'status must be a string').isString(),
    taskId: check('taskId', 'taskId must be a number >= 1').isInt()
};
