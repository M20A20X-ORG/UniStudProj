import { concat } from '@utils/concat.js';
import { ServerError } from '@exceptions/ServerError';

export class NoDataError extends ServerError {
    constructor(...message: string[]) {
        super(`No data!${concat(message, ', ')}`);
    }
}
