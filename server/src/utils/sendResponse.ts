import { Response } from 'express';
import { TResponse } from '@type/schemas/response';
import { log } from '@configs/loggerConfig';

export const sendResponse = (
    res: Response,
    status: number,
    message: string,
    stack: string | undefined
): Response => {
    if (status === 500) {
        log.err(stack ?? message);
        return res.sendStatus(status);
    }
    log.warn(message);
    return res.status(status).json({ message } as TResponse);
};
