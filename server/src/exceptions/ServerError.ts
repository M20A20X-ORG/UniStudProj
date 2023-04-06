import { concat } from '@utils/concat.js';

export class ServerError extends Error {
    constructor(...message: string[]) {
        super(`Error!${concat(message, ', ')}`);
    }
}
