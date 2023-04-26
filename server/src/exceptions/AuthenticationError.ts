import { ServerError } from '@exceptions/ServerError';

export class AuthenticationError extends ServerError {
    constructor(message: string) {
        super(`Authentication error! ${message}`);
    }
}
