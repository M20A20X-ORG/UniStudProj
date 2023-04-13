import { Schema } from 'ajv';
import { RequestHandler } from 'express';
import { TResponse } from '@type/schemas/response';

import { NoSchemaError } from '@exceptions/NoSchemaError';
import { SchemaValidationError } from '@exceptions/SchemaValidationError';

import { log } from '@configs/logger';
import { ajv } from '@configs/schemas';

export const validateSchema = (schema: Schema): RequestHandler => {
    const validate = ajv.compile(schema);
    if (!validate) throw new NoSchemaError(schema.toString());
    return (req, res, next) => {
        if (validate(req.body)) {
            return next();
        } else if (validate.errors) {
            const message = new SchemaValidationError(validate.errors.toString()).message;
            log.err(message);
            return res.status(404).send({ message } as TResponse);
        }
    };
};
