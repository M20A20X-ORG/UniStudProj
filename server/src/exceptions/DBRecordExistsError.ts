import { concat } from '@utils/concat.js';
import { ServerError } from '@exceptions/ServerError';

export class DBRecordExistsError extends ServerError {
    constructor(...message: string[]) {
        super(`Record already exists in database!${concat(message, ', ')}`);
    }
}
