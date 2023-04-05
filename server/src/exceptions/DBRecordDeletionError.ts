import { concat } from '@utils/concat.js';

export class DBRecordDeletionError extends Error {
    constructor(message) {
        super(`Error - can't delete database record!${concat(message, ', ')}`);
    }
}
