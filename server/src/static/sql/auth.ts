export const AUTH_SQL = {
    selectProjectRole: `SELECT pr.name AS projectRole
                      FROM (SELECT project_role_id
                            FROM tbl_users_of_projects
                            WHERE project_id = ?
                              AND user_id = ?) AS up
                               JOIN tbl_project_roles pr ON pr.role_id = up.project_role_id`
};
