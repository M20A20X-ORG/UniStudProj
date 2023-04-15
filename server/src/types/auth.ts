import { JwtPayload } from 'jsonwebtoken';

declare module 'jsonwebtoken' {
    interface JwtPayload {
        accessRole: string;
    }
}

declare module 'express-serve-static-core' {
    interface Request {
        user: JwtPayload | string | undefined;
    }
}
