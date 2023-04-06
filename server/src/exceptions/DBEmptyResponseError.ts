import { concat } from '@utils/concat.js';
import { ServerError } from '@exceptions/ServerError';

export class DBEmptyResponseError extends ServerError {
    constructor(...message: string[]) {
        super(`Empty response from database!${concat(message, ', ')}`);
    }
}
