import { RequestHandler } from 'express';
import { log } from '@configs/loggerConfig';

export const logRequest: RequestHandler = (req, res, next) => {
    log.info(
        `Request: ${JSON.stringify({
            remoteAddress: req.ip,
            method: req.method,
            url: req.url,
            httpVersion: req.httpVersionMinor
        })}`
    );
    return next();
};
