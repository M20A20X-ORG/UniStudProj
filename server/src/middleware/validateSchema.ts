import { RequestHandler } from 'express';

import { NoSchemaError } from '@exceptions/NoSchemaError';
import { SchemaValidationError } from '@exceptions/SchemaValidationError';

import { ajv } from '@configs/schemas';
import { sendResponse } from '@utils/sendResponse';

export const requireSchemaValidator = (schema: string): RequestHandler => {
    const validate = ajv.getSchema(schema);
    if (!validate) throw new NoSchemaError(schema.toString());
    return (req, res, next) => {
        if (validate(req.body)) {
            return next();
        } else if (validate.errors) {
            const [error] = validate.errors;
            const { params, keyword, instancePath } = error;

            let errMessage = error.message ?? '';
            if (keyword === 'required' || keyword === 'type')
                errMessage = `'${instancePath}' ${error.message}`;
            else if (keyword === 'format')
                errMessage = `'${instancePath}' must match format: '${ajv.formats[params.format]}'`;

            const { message } = new SchemaValidationError(errMessage);
            return sendResponse(res, 400, message, undefined);
        }
    };
};
