import { ServerError } from '@exceptions/ServerError';

export class RefreshTokenError extends ServerError {
    constructor(message: string) {
        super(`Refresh token error! ${message}`);
    }
}
