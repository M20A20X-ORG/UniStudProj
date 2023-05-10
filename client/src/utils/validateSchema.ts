import { AnyValidateFunction, ErrorObject } from 'ajv/dist/types';
import { NoSchemaError } from 'exceptions/NoSchemaError';
import { ajv } from 'configs/ajvConfig';

export const validateSchema = <T>(data: T, schema: string): ErrorObject | undefined => {
    const validate: AnyValidateFunction | undefined = ajv.getSchema(schema);
    if (!validate) throw new NoSchemaError(schema);
    validate(data);
    return validate?.errors?.[0];
};
