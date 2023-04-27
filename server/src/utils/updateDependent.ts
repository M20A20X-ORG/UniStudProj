import { QueryError } from 'mysql2';
import { PoolConnection } from 'mysql2/promise';
import { TGetSql } from '@type/sql';
import { DataModificationError } from '@exceptions/DataModificationError';

export const updateDependent = async <T>(
    connection: PoolConnection,
    getSql: TGetSql<T>,
    id: number,
    data: Array<T> | undefined,
    deleteData: number[] | undefined,
    errNoRefStr: string,
    errDupEntryStr: string = errNoRefStr
) => {
    try {
        const [insertSql, deleteSql, updateAmountSql] = getSql(id, data, deleteData);
        if (deleteSql) await connection.query(deleteSql);
        if (insertSql) await connection.query(insertSql);
        if ((deleteSql || insertSql) && updateAmountSql) await connection.query(updateAmountSql);
    } catch (error: unknown) {
        const { code } = error as QueryError;
        let message = '';

        if (code === 'ER_NO_REFERENCED_ROW_2') message = `Specified ${errNoRefStr} are not exists!`;
        else if (code === 'ER_DUP_ENTRY')
            message = `Specified ${errDupEntryStr} already added to this project!`;

        if (message) throw new DataModificationError(message);
        throw error;
    }
};
