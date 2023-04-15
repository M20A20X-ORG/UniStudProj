import { ServerError } from '@exceptions/ServerError';

export class AuthorizationError extends ServerError {
    constructor(message: string) {
        super(`Authorization error! Forbidden for role: ${message}`);
    }
}
