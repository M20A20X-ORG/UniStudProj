import Ajv from 'ajv';
import { TSchemaPatterns, TSchemasGeneral } from '@type/schema';
import { SCHEMAS } from '@schemas/index';

class AjvConfig {
    public readonly ajv: Ajv;

    private _SCHEMA_PATTERNS: TSchemaPatterns = {
        fullname: /^([A-Z][a-z]+\s?){3,}$/i,
        username: /^[a-z\d]{5,}$/,
        password: /^[\w\W]{6,}$/,
        email: /^[a-z\d]+@[a-z\d]+.[a-z\d]+$/
    };

    constructor(schemas: TSchemasGeneral) {
        this.ajv = new Ajv({ allErrors: true });
        this._addSchemaPatterns();
        this._addSchemas(schemas);
    }

    private _addSchemaPatterns = () => {
        Object.keys(this._SCHEMA_PATTERNS).forEach((key) =>
            this.ajv.addFormat(key, this._SCHEMA_PATTERNS[key])
        );
    };
    private _addSchemas = (schemaGeneral: TSchemasGeneral) => {
        Object.keys(schemaGeneral).forEach((schemaKey) => {
            const schema = schemaGeneral[schemaKey];
            Object.keys(schema).forEach((key) => this.ajv.addSchema(schema[key]));
        });
    };
}

export const { ajv } = new AjvConfig(SCHEMAS);
