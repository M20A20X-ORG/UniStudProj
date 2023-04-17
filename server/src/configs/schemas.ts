import Ajv from 'ajv';
import { TSchemaFormatGeneral, TSchemaGeneral } from '@type/schema';
import { SCHEMA_FORMATS, SCHEMAS } from '@schemas/index';

class AjvConfig {
    public readonly ajv: Ajv;

    constructor(schemas: TSchemaGeneral, patterns: TSchemaFormatGeneral) {
        this.ajv = new Ajv({ allErrors: true });
        this._addSchemaPatterns(patterns);
        this._addSchemas(schemas);
    }

    private _addSchemaPatterns = (patternsGeneral: TSchemaFormatGeneral) => {
        Object.keys(patternsGeneral).forEach((key) => {
            const patternObj = patternsGeneral[key];
            Object.keys(patternObj).forEach((key) => this.ajv.addFormat(key, patternObj[key]));
        });
    };
    private _addSchemas = (schemaGeneral: TSchemaGeneral) => {
        Object.keys(schemaGeneral).forEach((schemaKey) => {
            const schemaObj = schemaGeneral[schemaKey];
            Object.keys(schemaObj).forEach((key) => this.ajv.addSchema(schemaObj[key]));
        });
    };
}

export const { ajv } = new AjvConfig(SCHEMAS, SCHEMA_FORMATS);
