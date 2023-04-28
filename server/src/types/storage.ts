import { RequestHandler } from 'express';

export type TUploadType = 'single' | 'array';

export type TUpload = {
    [key: string]: {
        event: string;
        path: string;
        extensions: string[];
    };
};

export type TSetupUpload = (
    type: TUploadType,
    event: string,
    extensions: string[],
    path?: string
) => RequestHandler;
