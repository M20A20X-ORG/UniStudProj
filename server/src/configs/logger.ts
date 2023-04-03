import * as process from 'process';
import fs from 'fs';
import path, { sep } from 'path';

import { TLogConfig, TLogger, TLogHelper, TLogLevel } from '@type/logger';

import { concat } from '@utils/concat';
import { getIsoDate } from '@utils/date';

interface ILogger {
    info: TLogger;

    warn: TLogger;

    err: TLogger;

    debug: TLogger;
}

class Logger implements ILogger {
    //----- Fields -----//
    private readonly _logRoot = `${process.cwd()}${sep}log${sep}`;
    private readonly _logConfig: TLogConfig = {
        latestFile: this._logRoot + 'latest.log',
        debugFile: this._logRoot + 'debug.log'
    };
    private readonly _logLevel: TLogLevel = {
        // eslint-disable-next-line no-console
        info: [console.info, 'INFO'],
        // eslint-disable-next-line no-console
        warn: [console.warn, 'WARN'],
        // eslint-disable-next-line no-console
        debug: [console.info, 'DEBUG'],
        // eslint-disable-next-line no-console
        error: [console.error, 'ERROR']
    };
    private readonly _fileLogger: TLogger;

    //----- Methods -----//
    constructor() {
        this._fileLogger = this._createFileLogger();
    }

    private _logHelper: TLogHelper = ([handler, level], ...data) => {
        const prefix = `${getIsoDate()} [${level}]:`;
        handler(prefix, ...data);
        this._fileLogger(prefix, ...data);
    };

    private _createFileLogger = (): TLogger => {
        const { latestFile, debugFile } = this._logConfig;
        const currentFile = process.env.NODE_ENV === 'production' ? latestFile : debugFile;

        if (!fs.existsSync(this._logRoot)) {
            fs.mkdirSync(this._logRoot);
        }
        if (fs.existsSync(currentFile)) {
            const modifyTime = fs.statSync(currentFile).mtime.toISOString().replace(/:/g, '-');
            fs.renameSync(currentFile, this._logRoot + modifyTime + path.extname(currentFile));
        }

        return (...data) => {
            const stringData = data.map((part) =>
                typeof part === 'object' ? JSON.stringify(part) : part
            );
            fs.appendFileSync(currentFile, concat(stringData, ' ') + '\n');
        };
    };

    public info: TLogger = (...data) => {
        this._logHelper(this._logLevel.info, ...data);
    };

    public warn: TLogger = (...data) => {
        this._logHelper(this._logLevel.warn, ...data);
    };

    public err: TLogger = (...data) => {
        this._logHelper(this._logLevel.error, ...data);
    };

    public debug: TLogger = (...data) => {
        if (process.env.NODE_ENV === 'debug') {
            this._logHelper(this._logLevel.debug, ...data);
        }
    };
}

export const log = new Logger();
