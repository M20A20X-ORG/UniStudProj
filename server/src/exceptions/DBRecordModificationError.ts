import { concat } from '@utils/concat.js';

export class DBRecordModificationError extends Error {
    constructor(message) {
        super(`Error - can't modify database record!${concat(message, ', ')}`);
    }
}
