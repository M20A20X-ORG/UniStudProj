import { QueryError } from 'mysql2';

import { TPayloadResponse, TResponse } from '@type/schemas/response';
import { TNews, TNewsCreation, TNewsEdit } from '@type/schemas/news';

import { NEWS_SQL } from '@static/sql/news';

import { DataAddingError } from '@exceptions/DataAddingError';
import { NoDataError } from '@exceptions/NoDataError';
import { DataModificationError } from '@exceptions/DataModificationError';

import { sqlPool } from '@configs/sqlPool';

const { createSql, readSql, updateSql, deleteSql } = NEWS_SQL;

interface NewsService {
    createNews: (newsData: TNewsCreation[]) => Promise<TResponse>;
    getNews: (
        newsIds: number[],
        needCommonData: boolean,
        limit: number
    ) => Promise<TPayloadResponse<TNews[]>>;
    editNews: (newsData: TNewsEdit[]) => Promise<TPayloadResponse<TNews[]>>;
    deleteNews: (newsIds: number[]) => Promise<TResponse>;
}

class NewsServiceImpl implements NewsService {
    public createNews = async (newsData: TNewsCreation[]): Promise<TResponse> => {
        const { getInsertNews } = createSql;

        try {
            const insertNewsSql = getInsertNews(newsData);
            await sqlPool.query(insertNewsSql);
        } catch (error: unknown) {
            const { code } = error as QueryError;
            if (code === 'ER_NO_REFERENCED_ROW_2')
                throw new DataAddingError(`Specified author are not exists!`);
            if (code === 'ER_DUP_ENTRY') throw new DataAddingError(`News already created!`);
            throw error;
        }

        return { message: `Successfully created news, amount: ${newsData.length}` };
    };

    public getNews = async (
        newsIds: number[],
        needCommonData: boolean,
        limit: number
    ): Promise<TPayloadResponse<TNews[]>> => {
        const { getSelectNews } = readSql;

        const selectNews = getSelectNews(newsIds, needCommonData, limit);
        const dbNewsResponse = await sqlPool.query(selectNews);
        const [dbNews] = dbNewsResponse as any[];
        if (!dbNews.length)
            throw new NoDataError(`One from specified news, ids: [${newsIds}] are not found!`);

        const news = dbNews as TNews[];
        return {
            message: `Successfully got news, amount: ${dbNews.length}`,
            payload: news
        };
    };

    public editNews = async (newsData: TNewsEdit[]): Promise<TPayloadResponse<TNews[]>> => {
        const { getUpdateNews } = updateSql;

        const connection = await sqlPool.getConnection();
        try {
            await connection.beginTransaction();
            const promiseUpdates: Promise<void>[] = newsData.map(
                (n) =>
                    new Promise<void>(async (resolve, reject) => {
                        try {
                            const updateNewsSql = getUpdateNews(n);
                            if (updateNewsSql) await connection.query(updateNewsSql);
                            return resolve();
                        } catch (error: unknown) {
                            return reject(error);
                        }
                    })
            );
            await Promise.all(promiseUpdates);
            await connection.commit();
            connection.release();

            const newsIds = newsData.map((n) => n.newsId);
            const { payload: news } = await this.getNews(newsIds, false, 0);
            return {
                message: `Successfully updated news, amount: ${promiseUpdates.length}`,
                payload: news
            };
        } catch (error: unknown) {
            await connection.rollback();
            const { code } = error as QueryError;
            if (code === 'ER_NO_REFERENCED_ROW_2')
                throw new DataModificationError(`Specified author are not exists!`);
            if (code === 'ER_DUP_ENTRY')
                throw new DataModificationError(`Specified news already added!`);
            throw error;
        } finally {
            connection.release();
        }
    };

    public deleteNews = async (newsIds: number[]): Promise<TResponse> => {
        const { getDeleteNews } = deleteSql;

        const deleteNewsSql = getDeleteNews(newsIds);
        const dbDeletionResponse = await sqlPool.query(deleteNewsSql);
        const [dbDeletion] = dbDeletionResponse as any[];

        if (!dbDeletion.affectedRows)
            return { message: `One or few specified news, ids [${newsIds}] are not exists` };
        return { message: `Successfully deleted news, amount: ${newsIds.length}` };
    };
}

export const newsService = new NewsServiceImpl();
