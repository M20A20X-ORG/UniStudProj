import { concat } from '@utils/concat.js';
import { ServerError } from '@exceptions/ServerError';

export class SchemaValidationError extends ServerError {
    constructor(...message: string[]) {
        super(`Incorrect request schema!${concat(message, ', ')}`);
    }
}
