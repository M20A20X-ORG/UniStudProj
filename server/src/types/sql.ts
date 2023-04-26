export type TDependency<I, T> = Partial<I> & T;
export type TGetSqlReturn = [undefined | string, undefined | string, string];
export type TGetSql<T> = (
    projectId: number,
    data: Array<T> | undefined,
    deleteData: number[] | undefined
) => TGetSqlReturn;
