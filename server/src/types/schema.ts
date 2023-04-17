import { Schema } from 'ajv';

export type TSchemaPatterns = { [key: string]: RegExp };
export type TSchemas = { [key: string]: Schema };
export type TSchemasGeneral = { [key: string]: TSchemas };
