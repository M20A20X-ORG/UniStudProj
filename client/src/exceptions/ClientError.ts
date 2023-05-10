import { concat } from 'utils/concat';

export class ClientError extends Error {
    constructor(...message: string[]) {
        super(`Error!${concat(message, ', ')}`);
    }
}