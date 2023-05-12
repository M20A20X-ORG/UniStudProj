import { ClientError } from 'exceptions/ClientError';

export class SchemaError extends ClientError {
    constructor(message: string) {
        super(`Schema error! ${message}`);
    }
}
