import Ajv from 'ajv';
import { TSchema, TSchemaFormatGeneral, TSchemaFormats } from 'types/schemas/schema';
import { SCHEMA_FORMATS, SCHEMAS } from 'schemas/index';

interface AjvConfig {
    readonly ajv: Ajv;
}

class AjvConfigImpl implements AjvConfig {
    public readonly ajv: Ajv;

    constructor(schemas: TSchema, patterns: TSchemaFormatGeneral) {
        this.ajv = new Ajv({ allErrors: true });
        this._addSchemaPatterns(patterns);
        this._addSchemas(schemas);
    }

    private _addSchemaPatterns = (patternsGeneral: TSchemaFormatGeneral) => {
        Object.keys(patternsGeneral).forEach((key) => {
            const patternObj: TSchemaFormats = patternsGeneral[key];
            Object.keys(patternObj).forEach((key) => this.ajv.addFormat(key, patternObj[key]));
        });
    };
    private _addSchemas = (schemaGeneral: TSchema) => {
        Object.keys(schemaGeneral).forEach((schemaKey) => this.ajv.addSchema(schemaGeneral[schemaKey]));
    };
}

export const { ajv } = new AjvConfigImpl(SCHEMAS, SCHEMA_FORMATS);
