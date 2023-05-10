import { ClientError } from 'exceptions/ClientError';

export class NoSchemaError extends ClientError {
    constructor(message: string) {
        super(`No validation found for schema: ${message}`);
    }
}