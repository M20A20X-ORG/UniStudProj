import { concat } from '@utils/concat.js';
import { ServerError } from '@exceptions/ServerError';

export class DataModificationError extends ServerError {
    constructor(...message: string[]) {
        super(`Can't modify data!${concat(message, ', ')}`);
    }
}
