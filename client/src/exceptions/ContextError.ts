import { ClientError } from 'exceptions/ClientError';
import { concat } from 'utils/concat';

export class ContextError extends ClientError {
    constructor(...message: string[]) {
        super(`Context Error!${concat(message, ', ')}`);
    }
}
