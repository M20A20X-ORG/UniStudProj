import { concat } from '@utils/concat.js';
import { ServerError } from '@exceptions/ServerError';

export class RequestParamsError extends ServerError {
    constructor(...message: string[]) {
        super(`Request params are not provided or incorrect:${concat(message, ', ')}`);
    }
}
