import { RequestHandler } from 'express';
import { TResponse } from '@type/schemas/response';

import { NoSchemaError } from '@exceptions/NoSchemaError';
import { SchemaValidationError } from '@exceptions/SchemaValidationError';

import { log } from '@configs/logger';
import { ajv } from '@configs/schemas';

export const requireSchemaValidator = (schema: string): RequestHandler => {
    const validate = ajv.getSchema(schema);
    if (!validate) throw new NoSchemaError(schema.toString());
    return (req, res, next) => {
        if (validate(req.body)) {
            return next();
        } else if (validate.errors) {
            const [error] = validate.errors;
            const { params, keyword, instancePath } = error;

            let errMessage: string = error.message ?? '';
            if (keyword === 'format')
                errMessage = `'${instancePath}' must match format: '${ajv.formats[params.format]}'`;

            const message = new SchemaValidationError(errMessage).message;
            log.err(message);
            return res.status(404).send({ message } as TResponse);
        }
    };
};
