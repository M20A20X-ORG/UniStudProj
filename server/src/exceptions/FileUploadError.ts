import { ServerError } from '@exceptions/ServerError';

export class FileUploadError extends ServerError {
    constructor(message: string) {
        super(`File upload error! ${message}`);
    }
}
