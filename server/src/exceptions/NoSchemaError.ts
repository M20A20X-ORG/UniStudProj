import { ServerError } from '@exceptions/ServerError';

export class NoSchemaError extends ServerError {
    constructor(message: string) {
        super(`No validation found for schema: ${message}`);
    }
}
