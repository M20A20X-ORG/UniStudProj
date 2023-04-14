import { concat } from '@utils/concat.js';
import { ServerError } from '@exceptions/ServerError';

export class DataDeletionError extends ServerError {
    constructor(...message: string[]) {
        super(`Can't delete data!${concat(message, ', ')}`);
    }
}
