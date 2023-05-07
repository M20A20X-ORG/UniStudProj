import { QueryError } from 'mysql2';
import { PoolConnection } from 'mysql2/promise';
import { TGetSql, TModifyQueryResponse } from '@type/sql';

import { DataModificationError } from '@exceptions/DataModificationError';

import { log } from '@configs/loggerConfig';

const handleError = (
    error: unknown,
    errNoRefStr: string,
    errDupEntryStr: string = errNoRefStr
): void => {
    const { code } = error as QueryError;
    let message = '';

    if (code === 'ER_NO_REFERENCED_ROW_2') message = `Specified ${errNoRefStr} are not exists!`;
    else if (code === 'ER_DUP_ENTRY') message = `Specified ${errDupEntryStr} already added!`;

    if (message) throw new DataModificationError(message);
    throw error;
};

export const updateDependent = async <T>(
    connection: PoolConnection,
    getSql: TGetSql<T>,
    id: number,
    data: Array<T> | undefined,
    deleteData: number[] | undefined,
    errNoRefStr: string,
    errDupEntryStr: string = errNoRefStr
): Promise<void> => {
    try {
        const [insertSql, deleteSql, updateAmountSql] = getSql(id, data, deleteData);
        if (deleteSql) {
            const dbResponse: TModifyQueryResponse = await connection.query(deleteSql);
            log.debug(dbResponse);
        }
        if (insertSql?.length) {
            const promisesUpdate: Promise<void>[] = insertSql.map(
                (sql) =>
                    new Promise(async (resolve, reject) => {
                        try {
                            if (sql) {
                                const dbResponse = await connection.query(sql);
                                log.debug(dbResponse);
                            }
                            resolve();
                        } catch (error: unknown) {
                            reject(error);
                        }
                    })
            );
            await Promise.all(promisesUpdate);
        }
        if ((deleteSql || insertSql) && updateAmountSql) {
            const dbResponse: TModifyQueryResponse = await connection.query(updateAmountSql);
            log.debug(dbResponse);
        }
    } catch (error: unknown) {
        handleError(error, errNoRefStr, errDupEntryStr);
    }
};
