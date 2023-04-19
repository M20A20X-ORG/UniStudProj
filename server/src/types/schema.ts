import { Schema } from 'ajv';
import { ValidationChain } from 'express-validator';

export type TSchemas = { [key: string]: Schema };
export type TSchemaGeneral = { [key: string]: TSchemas };

export type TSchemaFormats = { [key: string]: RegExp };
export type TSchemaFormatGeneral = { [key: string]: TSchemaFormats };

export type TQueryValidators = { [key: string]: ValidationChain };
