import { TUpdateDependentSql } from '@type/sql';
import { TProjectEdit, TProjectParticipantId } from '@type/schemas/projects/project';
import { concat } from '@utils/concat';

type TProjectPublic = Pick<
    TProjectEdit,
    'projectId' | 'dateEnd' | 'dateStart' | 'description' | 'name'
>;

export const PROJECT_SQL = {
    deleteSql: {
        selectProjectName: `
        SELECT name
        FROM tbl_projects
        WHERE project_id = ?`,
        deleteProject: `
        DELETE
        FROM tbl_projects
        WHERE project_id = ?`,
        deleteProjectUsers: `
        DELETE
        FROM tbl_users_of_projects
        WHERE project_id = ?`,
        deleteProjectTags: `
        DELETE
        FROM tbl_tags_of_projects
        WHERE project_id = ?`
    },
    readSql: {
        getSelectProjects: (projectIds: number[]) => `
        SELECT project_id          AS projectId,
               date_start          AS dateStart,
               date_end            AS dateEnd,
               participants_amount AS participantsAmount,
               tags_amount         AS tagsAmount,
               name,
               description
        FROM tbl_projects
        WHERE project_id IN (${projectIds})`,
        getSelectTags: (projectIds: number[]) => `
        SELECT tp.project_id AS projectId, pt.tag_id AS tagId, pt.name AS tag
        FROM (SELECT project_id, tag_id
              FROM tbl_tags_of_projects
              WHERE project_id IN (${projectIds})) AS tp
                 JOIN tbl_project_tags pt ON pt.tag_id = tp.tag_id`,
        getSelectParticipants: (projectIds: number[]) => `
        SELECT up.project_id AS projectId,
               u.user_id     AS userId,
               u.username,
               pr.name       AS name,
               pr.role_id    AS roleId
        FROM (SELECT project_id, user_id, project_role_id
              FROM tbl_users_of_projects
              WHERE project_id IN (${projectIds})) AS up
                 JOIN tbl_users u ON u.user_id = up.user_id
                 JOIN tbl_project_roles pr ON pr.role_id = up.project_role_id`
    },
    createSql: {
        insertProject: `
        INSERT INTO tbl_projects(name, participants_amount, tags_amount, description, date_start,
                                 date_end)
        VALUES (?, ?, ?, ?, ?, ?)`,
        getInsertUsersSql: (projectId: number, participantIds: TProjectParticipantId[]): string => {
            const values = participantIds.map((p) => `(${[projectId, p.userId, p.projectRoleId]})`);
            return `
          INSERT INTO tbl_users_of_projects (project_id, user_id, project_role_id)
          VALUES ${values}`;
        },
        getInsertTagsSql: (projectId: number, tagIds: number[]): string => {
            const values = tagIds.map((tagId) => `(${[projectId, tagId]})`);
            return `
          INSERT INTO tbl_tags_of_projects (project_id, tag_id)
          VALUES ${values}`;
        }
    },
    updateSql: {
        getUpdateProjectSql: (projectData: TProjectPublic): string => {
            const { projectId, dateEnd, dateStart, name, description } = projectData;
            const values = concat([
                dateEnd ? "date_end = '" + dateEnd.trim() + "'" : '',
                dateStart ? "date_start = '" + dateStart.trim() + "'" : '',
                description !== undefined ? "description = '" + description.trim() + "'" : '',
                name ? "name = '" + name.trim() + "'" : ''
            ]);
            return (
                values
                && `
            UPDATE tbl_projects
            SET ${values}
            WHERE project_id = ${projectId}`
            );
        },
        getUpdateParticipantsSql: (
            projectId: number,
            participantIds?: TProjectParticipantId[],
            deleteParticipantIds?: number[]
        ): TUpdateDependentSql => {
            const updateAmount = `
          UPDATE tbl_projects AS p
          SET p.participants_amount = (SELECT COUNT(up.project_id)
                                       FROM tbl_users_of_projects AS up
                                       WHERE up.project_id = ${projectId})
          WHERE p.project_id = ${projectId}`;
            const insertSql = participantIds && [
                PROJECT_SQL.createSql.getInsertUsersSql(projectId, participantIds)
            ];
            const deleteSql
                = deleteParticipantIds
                && `
                  DELETE
                  FROM tbl_users_of_projects
                  WHERE project_id = ${projectId}
                    AND user_id IN (${deleteParticipantIds}`;

            return [insertSql, deleteSql, updateAmount];
        },
        getUpdateTagsSql: (
            projectId: number,
            tagIds?: number[],
            deleteTagIds?: number[]
        ): TUpdateDependentSql => {
            const insertSql = tagIds && [PROJECT_SQL.createSql.getInsertTagsSql(projectId, tagIds)];
            const deleteSql
                = deleteTagIds
                && `
                  DELETE
                  FROM tbl_tags_of_projects
                  WHERE project_id = ${projectId}
                    AND tag_id IN (${deleteTagIds})`;
            const updateAmount = `
          UPDATE tbl_projects AS p
          SET p.tags_amount = (SELECT COUNT(tp.project_id)
                               FROM tbl_tags_of_projects AS tp
                               WHERE tp.project_id = ${projectId})
          WHERE p.project_id = ${projectId}`;

            return [insertSql, deleteSql, updateAmount];
        }
    }
};
