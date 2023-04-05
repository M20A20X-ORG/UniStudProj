export type TLogConfig = { [key: string]: string };
export type TLogLevelEntry = [(...data: any[]) => void, string];
export type TLogLevel = { [key: string]: TLogLevelEntry };

type TLogData = Array<object | string>;
export type TLogHelper = ([handler, level]: TLogLevelEntry, ...data: TLogData) => void;
export type TLogger = (...data: TLogData) => void;
