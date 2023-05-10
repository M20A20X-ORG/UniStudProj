import { Schema } from 'ajv';

export type TSchema = { [key: string]: Schema };

export type TSchemaFormats = { [key: string]: RegExp };
export type TSchemaFormatGeneral = { [key: string]: TSchemaFormats };
