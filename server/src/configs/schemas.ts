import Ajv from 'ajv';
import { TSchemaPatterns } from '@type/schema';

export const ajv = new Ajv({ allErrors: true });

const SCHEMA_PATTERNS: TSchemaPatterns = {
    fullname: /^([A-Z][a-z]+\s?){3,}$/i,
    username: /^[a-z\d]{5,}$/,
    password: /^[\w\W]{6,}$/,
    email: /^[a-z\d]+@[a-z\d]+.[a-z\d]+$/
};

Object.keys(SCHEMA_PATTERNS).forEach((key) => ajv.addFormat(key, SCHEMA_PATTERNS[key]));
