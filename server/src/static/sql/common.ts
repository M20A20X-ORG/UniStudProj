export const COMMON_SQL = {
    getSelectLastInsertId: (alias: string) => `SELECT LAST_INSERT_ID() as ${alias}`
};

export const LIMIT_DEFAULT = 10;
