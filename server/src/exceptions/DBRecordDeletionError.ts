import { concat } from '@utils/concat.js';
import { ServerError } from '@exceptions/ServerError';

export class DBRecordDeletionError extends ServerError {
    constructor(...message: string[]) {
        super(`Can't delete database record!${concat(message, ', ')}`);
    }
}
