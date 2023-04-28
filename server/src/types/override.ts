import { TAuthPayload } from '@type/schemas/auth';

declare module 'http' {
    interface IncomingHttpHeaders {
        'refresh-token'?: string;
        'project-id'?: string;
    }
}

declare module 'express-serve-static-core' {
    interface Request {
        user: TAuthPayload | undefined;
    }
}
