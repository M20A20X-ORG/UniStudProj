import { AUTH_SCHEMA } from './auth';
import { USER_FORMAT, USER_SCHEMA } from './users';
import { PROJECT_FORMATS, PROJECT_SCHEMA } from './projects';

import { TSchemaFormatGeneral, TSchemaGeneral } from '@type/schema';

export const SCHEMAS: TSchemaGeneral = {
    AUTH_SCHEMA,
    USER_SCHEMA,
    PROJECT_SCHEMA
};

export const SCHEMA_FORMATS: TSchemaFormatGeneral = {
    USER_FORMAT,
    PROJECT_FORMATS
};
