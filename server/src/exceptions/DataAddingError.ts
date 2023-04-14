import { concat } from '@utils/concat.js';
import { ServerError } from '@exceptions/ServerError';

export class DataAddingError extends ServerError {
    constructor(...message: string[]) {
        super(`Can't add new data!${concat(message, ', ')}`);
    }
}
