import { QueryError } from 'mysql2';
import { TModifyQueryResponse, TReadQueryResponse } from '@type/sql';
import { TResponse } from '@type/schemas/response';
import { TNews, TNewsCreation, TNewsEdit } from '@type/schemas/news';

import { DataAddingError } from '@exceptions/DataAddingError';

import { NEWS_SQL } from '@static/sql/news';
import { sqlPool } from '@configs/sqlPoolConfig';

import { log } from '@configs/loggerConfig';

const { createSql, readSql, updateSql, deleteSql } = NEWS_SQL;

interface NewsService {
    createNews: (newsData: TNewsCreation) => Promise<TResponse>;
    getNews: () => Promise<TResponse<TNews[]>>;
    editNews: (newsData: TNewsEdit) => Promise<TResponse>;
    deleteNews: (newsId: number) => Promise<TResponse>;
}

class NewsServiceImpl implements NewsService {
    public createNews = async (newsData: TNewsCreation): Promise<TResponse> => {
        const { getInsertNews } = createSql;

        try {
            const insertNewsSql = getInsertNews(newsData);
            const dbNewsResponse: TReadQueryResponse = await sqlPool.query(insertNewsSql);
            log.debug(dbNewsResponse);
        } catch (error: unknown) {
            const { code } = error as QueryError;
            if (code === 'ER_NO_REFERENCED_ROW_2')
                throw new DataAddingError(`Specified author are not exists!`);
            if (code === 'ER_DUP_ENTRY') throw new DataAddingError(`News already created!`);
            throw error;
        }

        return { message: `Successfully create news` };
    };

    public getNews = async (): Promise<TResponse<TNews[]>> => {
        const { selectNews } = readSql;

        const dbNewsResponse: TReadQueryResponse = await sqlPool.query(selectNews);
        const [dbNews] = dbNewsResponse;
        if (!dbNews.length) return { message: `No news was found` };

        const news = dbNews as TNews[];
        return {
            message: `Successfully get news, amount: ${dbNews.length}`,
            payload: news
        };
    };

    public editNews = async (newsData: TNewsEdit): Promise<TResponse> => {
        const { getUpdateNews } = updateSql;

        try {
            const updateNewsSql = getUpdateNews(newsData);
            if (updateNewsSql) {
                const dbNewsResponse: TModifyQueryResponse = await sqlPool.query(updateNewsSql);
                log.debug(dbNewsResponse);
            }

            return { message: `Successfully update news, id: ${newsData.newsId}` };
        } catch (error: unknown) {
            const { code } = error as QueryError;
            if (code === 'ER_NO_REFERENCED_ROW_2')
                return { message: `Specified news or user id aren't exists` };
            throw error;
        }
    };

    public deleteNews = async (newsId: number): Promise<TResponse> => {
        const { getDeleteNews } = deleteSql;

        const deleteNewsSql = getDeleteNews(newsId);
        const dbDeletionResponse: TModifyQueryResponse = await sqlPool.query(deleteNewsSql);
        const [dbDeletion] = dbDeletionResponse;
        if (!dbDeletion.affectedRows)
            return { message: `Specified news, id: ${newsId} are not exists!` };

        return { message: `Successfully deleted news, id: ${newsId}` };
    };
}

export const newsService = new NewsServiceImpl();
