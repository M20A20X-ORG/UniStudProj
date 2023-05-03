import { check } from 'express-validator';

export const METRICS_QUERY = {
    updateAction: check('updateAction', `'updateAction' must be a string`).isString()
} as const;
