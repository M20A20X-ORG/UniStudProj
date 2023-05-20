import { RequestHandler } from 'express';

import { NoSchemaError } from '@exceptions/NoSchemaError';
import { SchemaValidationError } from '@exceptions/SchemaValidationError';

import { ajv } from '@configs/schemaConfig';
import { sendResponse } from '@utils/sendResponse';

export const requireSchemaValidator = (schema: string): RequestHandler => {
    const validate = ajv.getSchema(schema);
    if (!validate) throw new NoSchemaError(schema.toString());
    return (req, res, next) => {
        if (validate(req.body)) {
            return next();
        } else if (validate.errors) {
            const { message } = new SchemaValidationError(JSON.stringify(validate.errors));
            return sendResponse(res, 400, message, undefined);
        }
    };
};
