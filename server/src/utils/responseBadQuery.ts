import { Response } from 'express';
import { TResponse } from '@type/schemas/response';

import { RequestParamsError } from '@exceptions/RequestParamsError';

import { log } from '@configs/logger';

export const responseBadQuery = (res: Response, errorMessage: string) => {
    const message = new RequestParamsError(errorMessage).message;
    log.warn(message);
    return res.status(404).json({ message } as TResponse);
};

export const requireResponseBadQuery = (message: string) => (res: Response) =>
    responseBadQuery(res, message);
