import * as process from 'process';
import fs from 'fs';
import path from 'path';

import { TLogConfig, TLogger, TLogHandler, TLogHelper } from '@type/logger';

import { concat } from '@utils/concat';
import { getDbDate } from '@utils/date';

interface Logger {
    info: TLogger;

    warn: TLogger;

    err: TLogger;

    debug: TLogger;
}

class LoggerImpl implements Logger {
    ///// Private /////
    private readonly _logRoot = path.join(process.cwd(), 'log');
    private readonly _logFile: TLogConfig = {
        latestFile: path.join(this._logRoot, 'latest.log'),
        debugFile: path.join(this._logRoot, 'debug.log')
    };
    private readonly _logHandler: TLogHandler = {
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

    private _logHelper: TLogHelper = ([logHandler, level], ...data) => {
        const prefix = `${getDbDate()} [${level}]:`;
        logHandler(prefix, ...data);
        this._fileLogger(prefix, ...data);
    };

    private _createFileLogger = (): TLogger => {
        const { latestFile, debugFile } = this._logFile;
        const currentFile: string = process.env.NODE_ENV === 'production' ? latestFile : debugFile;

        if (!fs.existsSync(this._logRoot)) {
            fs.mkdirSync(this._logRoot);
        }
        if (fs.existsSync(currentFile)) {
            const modifyTime: string = fs
                .statSync(currentFile)
                .mtime.toISOString()
                .replace(/:/g, '-');
            const newPath: string = path.join(
                this._logRoot,
                modifyTime + path.extname(currentFile)
            );
            fs.renameSync(currentFile, newPath);
        }

        return (...data) => {
            const stringData: string[] = data.map((part) =>
                typeof part === 'object' ? JSON.stringify(part) : part
            );
            fs.appendFileSync(currentFile, concat(stringData, ' ') + '\n');
        };
    };

    ///// Public /////
    constructor() {
        this._fileLogger = this._createFileLogger();
    }

    public info: TLogger = (...data) => this._logHelper(this._logHandler.info, ...data);

    public warn: TLogger = (...data) => this._logHelper(this._logHandler.warn, ...data);

    public err: TLogger = (...data) => this._logHelper(this._logHandler.error, ...data);

    public debug: TLogger = (...data) => {
        if (process.env.NODE_ENV === 'debug') this._logHelper(this._logHandler.debug, ...data);
    };
}

export const log = new LoggerImpl();
