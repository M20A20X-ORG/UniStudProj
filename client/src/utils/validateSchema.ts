import { AnyValidateFunction, ErrorObject } from 'ajv/dist/types';
import { SchemaError } from 'exceptions/SchemaError';
import { ajv } from 'configs/ajvConfig';

export const validateSchema = (data: any, schema: string): ErrorObject | undefined => {
    const validate: AnyValidateFunction | undefined = ajv.getSchema(schema);
    if (!validate) throw new SchemaError(schema);
    validate(data);
    return validate?.errors?.[0];
};
