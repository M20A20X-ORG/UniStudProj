import { AUTH_SCHEMA } from './auth';
import { USER_FORMAT, USER_SCHEMA } from './users';

import { TSchemaFormatGeneral, TSchemaGeneral } from '@type/schema';

export const SCHEMAS: TSchemaGeneral = {
    AUTH_SCHEMA,
    USER_SCHEMA
};

export const SCHEMA_FORMATS: TSchemaFormatGeneral = {
    USER_FORMAT
};
