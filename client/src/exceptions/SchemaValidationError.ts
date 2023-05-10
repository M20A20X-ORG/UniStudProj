import { concat } from 'utils/concat';
import { ClientError } from './ClientError';

export class SchemaValidationError extends ClientError {
    constructor(...message: string[]) {
        super(`Incorrect request schema!${concat(message, ', ')}`);
    }
}
