import { concat } from '@utils/concat.js';

export class DBRecordExistsError extends Error {
    constructor(message) {
        super(`Error - record already exists in database!${concat(message, ', ')}`);
    }
}
