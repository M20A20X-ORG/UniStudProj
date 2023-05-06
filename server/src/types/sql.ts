import { FieldPacket, ResultSetHeader, RowDataPacket } from 'mysql2/index';

export type TDependency<I, T> = Partial<I> & T;
export type TUpdateDependentSql = [string[] | undefined, string | undefined, string?];
export type TGetSql<T> = (id: number, data?: T[], deleteData?: number[]) => TUpdateDependentSql;

export type TReadQueryResponse = [RowDataPacket[], FieldPacket[]];
export type TModifyQueryResponse = [ResultSetHeader, FieldPacket[]];
