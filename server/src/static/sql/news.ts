import { TNewsCreation, TNewsEdit } from '@type/schemas/news';
import { concat } from '@utils/concat';

export const NEWS_SQL = {
    createSql: {
        getInsertNews: (newsData: TNewsCreation): string => {
            const n = newsData;
            const values = `(${n.authorId},'${n.heading}','${n.text}')`;
            return `
          INSERT INTO tbl_news(author_id, heading, text)
          VALUES ${values}`;
        }
    },
    readSql: {
        selectNews: `
        SELECT n.news_id as newsId, u.username as author, n.heading, text
        FROM (SELECT news_id, author_id, heading, text
              FROM tbl_news) AS n
                 JOIN tbl_users u ON u.user_id = n.author_id`
    },
    updateSql: {
        getUpdateNews: (news: TNewsEdit): string => {
            const { newsId, authorId, heading, text } = news;
            const values = concat([
                authorId ? 'author_id = ' + authorId : '',
                heading !== undefined ? "heading = '" + heading.trim() + "'" : '',
                text !== undefined ? "text = '" + text.trim() + "'" : ''
            ]);
            return (
                values
                && `
            UPDATE tbl_news
            SET ${values}
            WHERE news_id = ${newsId}`
            );
        }
    },
    deleteSql: {
        getDeleteNews: (newsId: number) => `
        DELETE
        FROM tbl_news
        WHERE news_id = ${newsId}`
    }
};
