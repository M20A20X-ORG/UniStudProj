import { AUTH_SCHEMA } from './auth';
import { USER_FORMAT, USER_SCHEMA } from './users';
import { PROJECT_FORMATS, PROJECT_SCHEMA } from './projects';
import { TASK_FORMATS, TASK_SCHEMA } from './projects/tasks';
import { TEST_FORMAT, TEST_SCHEMA } from '@schemas/tests';
import { QUESTION_SCHEMA } from '@schemas/tests/question';

import { TSchemaFormatGeneral, TSchemaGeneral } from '@type/schema';

export const SCHEMAS: TSchemaGeneral = {
    AUTH_SCHEMA,
    USER_SCHEMA,
    PROJECT_SCHEMA,
    TASK_SCHEMA,
    TEST_SCHEMA,
    QUESTION_SCHEMA
};

export const SCHEMA_FORMATS: TSchemaFormatGeneral = {
    USER_FORMAT,
    PROJECT_FORMATS,
    TASK_FORMATS,
    TEST_FORMAT
};
