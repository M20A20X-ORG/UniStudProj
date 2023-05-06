import { concat } from '@utils/concat';
import { TUserEdit } from '@type/schemas/user';

type TUserCommon = Omit<TUserEdit, 'passwordConfirm'> & { passwordHash?: string };

export const USER_SQL = {
    createSql: {
        insertUser: `
        INSERT INTO tbl_users(role_id, name, email, password, username, about, \`group\`)
        VALUES (?, ?, ?, ?, ?, ?, ?)`
    },
    readSql: {
        getSelectUsers: (userIdentifiers: Array<string | number>) => `
        SELECT u.user_id AS userId,
               ur.name   AS role,
               u.email,
               u.username,
               u.name,
               u.about,
               u.group
        FROM (SELECT user_id,
                     role_id,
                     name,
                     email,
                     password,
                     username,
                     about,
                     \`group\`
              FROM tbl_users
              WHERE ${
                  typeof [userIdentifiers] === 'string' ? 'username' : 'user_id'
              } IN (${userIdentifiers})) AS u
                 JOIN tbl_user_roles ur ON ur.role_id = u.role_id`
    },
    updateSql: {
        getUpdateUsers: (userCommon: TUserCommon): string => {
            const { userId, email, username, name, group, about, passwordHash, password }
                = userCommon;
            const values = concat([
                email ? "email = '" + email.trim() + "'" : '',
                username ? "username = '" + username.trim() + "'" : '',
                password ? "password = '" + passwordHash + "'" : '',
                name ? "name = '" + name.trim() + "'" : '',
                group ? "`group` = '" + group.trim() + "'" : '',
                about ? "about = '" + about.trim() + "'" : ''
            ]);
            return (
                values
                && `
          UPDATE tbl_users
          SET ${values}
          WHERE user_id = ${userId}`
            );
        }
    },
    deleteSql: {
        selectUserEmail: `
        SELECT email
        FROM tbl_users
        WHERE user_id = ?`,
        deleteUser: `
        DELETE
        FROM tbl_users
        WHERE user_id = ?`
    }
};
