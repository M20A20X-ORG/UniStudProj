import { TUpdateDependentSql } from '@type/sql';
import { TProjectEdit, TProjectParticipantId } from '@type/schemas/projects/project';
import { concat } from '@utils/concat';

export const PROJECT_SQL = {
    deleteSql: {
        selectProjectName: `SELECT name
                            FROM tbl_projects
                            WHERE project_id = ?`,
        deleteProject: `DELETE
                        FROM tbl_projects
                        WHERE project_id = ?`,
        deleteProjectUsers: `DELETE
                             FROM tbl_users_of_projects
                             WHERE project_id = ?`,
        deleteProjectTags: `DELETE
                            FROM tbl_tags_of_projects
                            WHERE project_id = ?`
    },
    readSql: {
        getSelectProjects: (projectIds: number[]) => `SELECT project_id          AS projectId,
                                                             date_start          AS dateStart,
                                                             date_end            AS dateEnd,
                                                             participants_amount AS participantsAmount,
                                                             tags_amount         AS tagsAmount,
                                                             name,
                                                             description
                                                      FROM tbl_projects
                                                      WHERE project_id IN (${projectIds.toString()})`,
        getSelectTags: (
            projectIds: number[]
        ) => `SELECT tp.project_id AS projectId, pt.tag_id AS tagId, pt.name AS tag
              FROM (SELECT project_id, tag_id
                    FROM tbl_tags_of_projects
                    WHERE project_id IN (${projectIds.toString()})) AS tp
                       JOIN tbl_project_tags pt ON pt.tag_id = tp.tag_id`,
        getSelectParticipants: (projectIds: number[]) => `SELECT up.project_id AS projectId,
                                                                 u.user_id     AS userId,
                                                                 u.username,
                                                                 pr.name       AS name,
                                                                 pr.role_id    AS roleId
                                                          FROM (SELECT project_id, user_id, project_role_id
                                                                FROM tbl_users_of_projects
                                                                WHERE project_id IN (${projectIds.toString()})) AS up
                                                                   JOIN tbl_users u ON u.user_id = up.user_id
                                                                   JOIN tbl_project_roles pr ON pr.role_id = up.project_role_id`
    },
    createSql: {
        insertProject: `INSERT INTO tbl_projects(name, participants_amount, tags_amount, description, date_start,
                                                 date_end)
                        VALUES (?, ?, ?, ?, ?, ?)`,
        selectNewProjectId: `SELECT LAST_INSERT_ID() as newProjectId`,
        getInsertUsersSql: (
            projectId: number,
            participantIds: TProjectParticipantId[]
        ) => `INSERT INTO tbl_users_of_projects (project_id, user_id, project_role_id)
              VALUES ${participantIds
                  .map((p) => '(' + concat([projectId, p.userId, p.projectRoleId]) + ')')
                  .toString()}`,
        getInsertTagsSql: (
            projectId: number,
            tagIds: number[]
        ) => `INSERT INTO tbl_tags_of_projects (project_id, tag_id)
              VALUES ${tagIds.map((tagId) => '(' + projectId + ',' + tagId + ')').toString()}`
    },
    updateSql: {
        getUpdateProjectsSql: (
            projectData: Pick<
                TProjectEdit,
                'projectId' | 'dateEnd' | 'dateStart' | 'description' | 'name'
            >
        ) => {
            const { projectId, dateEnd, dateStart, name, description } = projectData;
            return `UPDATE tbl_projects
                    SET ${concat([
                        dateEnd ? "date_end = '" + dateEnd.trim() + "'" : '',
                        dateStart ? "date_start = '" + dateStart.trim() + "'" : '',
                        description !== undefined
                            ? "description = '" + description.trim() + "'"
                            : '',
                        name ? "name = '" + name.trim() + "'" : ''
                    ])}
                    WHERE project_id = ${projectId}`;
        },
        getUpdateParticipantsSql: (
            projectId: number,
            participantIds: TProjectParticipantId[] | undefined,
            deleteParticipantIds: number[] | undefined
        ): TUpdateDependentSql => {
            const updateAmount = `UPDATE tbl_projects AS p
                            SET p.participants_amount = (SELECT COUNT(up.project_id)
                                                         FROM tbl_users_of_projects AS up
                                                         WHERE up.project_id = ${projectId})
                            WHERE p.project_id = ${projectId}`;
            const insertSql = participantIds && [
                PROJECT_SQL.createSql.getInsertUsersSql(projectId, participantIds)
            ];
            const deleteSql =
                deleteParticipantIds &&
                `DELETE
               FROM tbl_users_of_projects
               WHERE project_id = ${projectId}
                 AND user_id IN (${deleteParticipantIds.toString()}`;

            return [insertSql, deleteSql, updateAmount];
        },
        getUpdateTagsSql: (
            projectId: number,
            tagIds: number[] | undefined,
            deleteTagIds: number[] | undefined
        ): TUpdateDependentSql => {
            const insertSql = tagIds && [PROJECT_SQL.createSql.getInsertTagsSql(projectId, tagIds)];
            const updateAmount = `UPDATE tbl_projects AS p
                                  SET p.tags_amount = (SELECT COUNT(tp.project_id)
                                                       FROM tbl_tags_of_projects AS tp
                                                       WHERE tp.project_id = ${projectId})
                                  WHERE p.project_id = ${projectId}`;
            const deleteSql =
                deleteTagIds &&
                `DELETE
               FROM tbl_tags_of_projects
               WHERE project_id = ${projectId}
                 AND tag_id IN (${deleteTagIds.toString()})`;

            return [insertSql, deleteSql, updateAmount];
        }
    }
};
