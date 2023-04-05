export type TLogConfig = { [key: string]: string };
export type TLogLevelEntry = [(...data: any[]) => void, string];
export type TLogLevel = { [key: string]: TLogLevelEntry };

export type TLogHelper = ([handler, level]: TLogLevelEntry, ...data: string[]) => void;
export type TLogger = (...data: string[]) => void;
