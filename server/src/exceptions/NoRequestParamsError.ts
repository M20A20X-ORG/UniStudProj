import { concat } from '@utils/concat.js';
import { ServerError } from '@exceptions/ServerError';

export class NoRequestParamsError extends ServerError {
    constructor(...message: string[]) {
        super(`No following request params:${concat(message, ', ')}`);
    }
}
