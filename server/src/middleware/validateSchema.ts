import { RequestHandler } from 'express';
import { Schema } from 'ajv';

import { ajv } from '@configs/schemas';
import { log } from '@configs/logger';

export const validateSchema = (schema: Schema): RequestHandler => {
    const validate = ajv.compile(schema);
    if (!validate) {
        throw new Error(`No validation found for schema "${schema}"`);
    }

    return (req, res, next) => {
        if (validate(req.body)) {
            return next();
        } else if (validate.errors) {
            log.warn(validate.errors);
            res.status(500).send({ error: validate.errors });
        }
    };
};
