import { ServerError } from '@exceptions/ServerError';

export class InvalidAccessRolesError extends ServerError {
    constructor(message: string) {
        super(`Invalid access role name: ${message}`);
    }
}
