import { TNewsCreation, TNewsEdit } from '@type/schemas/news';
import { concat } from '@utils/concat';

export const NEWS_SQL = {
    createSql: {
        getInsertNews: (newsData: TNewsCreation[]) => {
            const values = newsData.map((n) => `(${n.authorId},'${n.heading}','${n.text}')`);
            return `
          INSERT INTO tbl_news(author_id, heading, text)
          VALUES ${values}`;
        }
    },
    readSql: {
        getSelectNews: (newsIds: number[], needCommonData: boolean, limit: number) => {
            const textField = !needCommonData ? ', n.text' : '';
            return `
          SELECT n.author_id AS authorId, u.username, n.heading ${textField}
          FROM (SELECT news_id, author_id, heading, text
                FROM tbl_news ${limit ? ' LIMIT ' + limit : `WHERE news_id IN (${newsIds})`}) AS n
                   JOIN tbl_users u ON u.user_id = n.author_id`;
        }
    },
    updateSql: {
        getUpdateNews: (newsIds: TNewsEdit) => {
            const { newsId, authorId, heading, text } = newsIds;
            const values = concat([
                authorId ? 'author_id = ' + authorId : '',
                heading !== undefined ? "heading = '" + heading.trim() + "'" : '',
                text !== undefined ? "text = '" + text.trim() + "'" : ''
            ]);
            return (
                values &&
                `
            UPDATE tbl_news
            SET ${values}
            WHERE news_id = ${newsId}`
            );
        }
    },
    deleteSql: {
        getDeleteNews: (newsIds: number[]) => `
        DELETE
        FROM tbl_news
        WHERE news_id IN (${newsIds})`
    }
};
