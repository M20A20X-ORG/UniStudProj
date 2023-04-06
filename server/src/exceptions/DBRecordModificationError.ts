import { concat } from '@utils/concat.js';
import { ServerError } from '@exceptions/ServerError';

export class DBRecordModificationError extends ServerError {
    constructor(...message: string[]) {
        super(`Can't modify database record!${concat(message, ', ')}`);
    }
}
