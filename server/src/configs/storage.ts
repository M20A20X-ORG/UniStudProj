import path from 'path';
import fs from 'fs';
import * as process from 'process';
import multer, { diskStorage, Options } from 'multer';

import { TFileRequestBody, TFileUpload, TSetupUpload, TUploadSetup } from '@type/storage';
import { FileUploadError } from '@exceptions/FileUploadError';

interface StorageConfig {
    readonly storageRoot: string;
    setupUpload: TSetupUpload;
}

class StorageConfigImpl implements StorageConfig {
    public readonly storageRoot = path.join(process.cwd(), 'storage');
    private MAX_FILE_SIZE_B = 1048576;

    private _upload: TUploadSetup = {};

    private _diskStorageConfig = diskStorage({
        destination: (req, file, next) => {
            if (!fs.existsSync(this.storageRoot)) fs.mkdirSync(this.storageRoot);

            const { event } = req.body as TFileRequestBody;
            const filePath: string = this._upload[event].path;
            if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);

            return next(null, filePath);
        },
        filename: (req, file, next) => {
            const date = new Date().toISOString().replace(/:/g, '-');
            return next(null, `${date}-${file.originalname}`);
        }
    });

    private _fileFilter: Options['fileFilter'] = (req, file, next) => {
        if (!file) return next(new FileUploadError('File is not provided!'));

        const { event } = req.body || {};
        const upload: TFileUpload = this._upload?.[event];
        if (typeof event !== 'string' || !upload)
            return next(new FileUploadError('Upload event is incorrect or not exists!'));

        const isExtensionValid = upload.extensions.includes(
            path.extname(file.originalname).slice(1)
        );
        if (!isExtensionValid)
            return next(new FileUploadError(`Incorrect file extension: '${file.originalname}'`));

        return next(null, true);
    };

    private _multer = multer({
        storage: this._diskStorageConfig,
        fileFilter: this._fileFilter,
        limits: { fileSize: this.MAX_FILE_SIZE_B }
    });

    public setupUpload: TSetupUpload = (type, event, extensions, path) => {
        this._upload[event] = {
            event,
            path: this.storageRoot.concat(path || ''),
            extensions
        };
        return this._multer[type](event);
    };
}

export const { setupUpload, storageRoot } = new StorageConfigImpl();
