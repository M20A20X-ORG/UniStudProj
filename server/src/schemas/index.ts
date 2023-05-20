import { check } from 'express-validator';

import { AUTH_SCHEMA } from './auth';
import { USER_FORMAT, USER_SCHEMA } from './users';
import { PROJECT_FORMATS, PROJECT_SCHEMA } from './projects';
import { TASK_FORMATS, TASK_SCHEMA } from './projects/tasks';
import { NEWS_SCHEMA } from './news';

import { TSchemaFormatGeneral, TSchemaGeneral } from '@type/schema';

export const SCHEMAS: TSchemaGeneral = {
    AUTH_SCHEMA,
    USER_SCHEMA,
    PROJECT_SCHEMA,
    TASK_SCHEMA,
    NEWS_SCHEMA
};

export const SCHEMA_FORMATS: TSchemaFormatGeneral = {
    USER_FORMAT,
    PROJECT_FORMATS,
    TASK_FORMATS
};

export const COMMON_QUERY = {
    needCommon: check('needCommon', "'needCommon' must be an boolean").optional().isBoolean(),
    limit: check('limit', "'limit' must be a number >= 0").optional().isInt({ min: 0 })
};
