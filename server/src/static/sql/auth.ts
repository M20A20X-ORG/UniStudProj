export const AUTH_SQL = {
    selectProjectRoleSql: `
      SELECT pr.name AS projectRole
      FROM (SELECT project_role_id
            FROM tbl_users_of_projects
            WHERE project_id = ?
              AND user_id = ?) AS up
               JOIN tbl_project_roles pr ON pr.role_id = up.project_role_id`,
    refreshTokenSql: {
        selectToken: `
        SELECT user_id AS userId, access_ip AS accessIp, expire_date AS expireDate, token
        FROM tbl_user_refresh_tokens
        WHERE token = ?`,
        selectUser: `
        SELECT u.user_id AS userId,
               ur.name   AS role
        FROM (SELECT *
              FROM tbl_users
              WHERE user_id = ?) AS u
                 JOIN tbl_user_roles ur ON ur.role_id = u.role_id`,
        deleteToken: `
        DELETE
        FROM tbl_user_refresh_tokens
        WHERE token = ?`
    },
    loginSql: {
        selectUserData: `
        SELECT u.user_id  AS userId,
               u.password AS passwordHash,
               ur.name    AS role,
               u.*
        FROM (SELECT *
              FROM tbl_users
              WHERE username = ?) AS u
                 JOIN tbl_user_roles ur ON ur.role_id = u.role_id`,
        insertRefreshToken: `
        INSERT INTO tbl_user_refresh_tokens(token, user_id, access_ip, expire_date)
        VALUES (?, ?, ?, ?)`
    }
};
