export type TDependency<I, T> = Partial<I> & T;
export type TUpdateDependentSql = [Array<string> | undefined, string | undefined, string?];
export type TGetSql<T> = (
    id: number,
    data: Array<T> | undefined,
    deleteData: number[] | undefined
) => TUpdateDependentSql;
