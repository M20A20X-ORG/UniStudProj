import Ajv from 'ajv';
import { TSchema } from 'types/rest/responses/schema';

import { SCHEMAS } from 'schemas/index';

interface AjvConfig {
    readonly ajv: Ajv;
}

class AjvConfigImpl implements AjvConfig {
    public readonly ajv: Ajv;

    constructor(schemas: TSchema) {
        this.ajv = new Ajv({ allErrors: true });
        this._addSchemas(schemas);
    }

    private _addSchemas = (schemaGeneral: TSchema) => {
        Object.keys(schemaGeneral).forEach((schemaKey) => this.ajv.addSchema(schemaGeneral[schemaKey]));
    };
}

export const { ajv } = new AjvConfigImpl(SCHEMAS);
