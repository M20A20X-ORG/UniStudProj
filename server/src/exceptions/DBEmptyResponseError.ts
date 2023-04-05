import { concat } from '@utils/concat.js';

export class DBEmptyResponseError extends Error {
    constructor(message) {
        super(`Error - empty response from database!${concat(message, ', ')}`);
    }
}
