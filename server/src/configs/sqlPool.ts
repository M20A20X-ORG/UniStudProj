import mysql2, { PoolOptions } from 'mysql2';
import { Pool } from 'mysql2/promise';

const poolConfig: PoolOptions = {
    port: 3306,
    connectionLimit: 1,
    host: '127.0.0.1',
    user: 'root',
    password: '1234',
    database: 'unistudproj'
};
export const sqlPool: Pool = mysql2.createPool(poolConfig).promise();
