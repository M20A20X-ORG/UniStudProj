import { RequestHandler } from 'express';

export type TFileRequestBody = { event: string; [key: string]: string };
export type TUploadType = 'single' | 'array';

export type TFileUpload = {
    event: string;
    path: string;
    extensions: string[];
};

export type TUploadSetup = { [key: string]: TFileUpload };

export type TSetupUpload = (
    type: TUploadType,
    event: string,
    extensions: string[],
    path?: string
) => RequestHandler;
