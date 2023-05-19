import { concat } from '@utils/concat';
import { TTaskEditCommon } from '@type/schemas/projects/tasks';
import { TUpdateDependentSql } from '@type/sql';

export const TASK_SQL = {
    deleteSql: {
        selectTaskName: `
            SELECT name
            FROM tbl_project_tasks
            WHERE project_id = ?
              AND task_id = ?`,
        deleteTask: `
            DELETE
            FROM tbl_project_tasks
            WHERE project_id = ?
              AND task_id = ?`,
        deleteTaskTags: `
            DELETE
            FROM tbl_tags_of_tasks
            WHERE task_id = ?`
    },
    readSql: {
        selectStatuses: `SELECT status_id as statusId, name as status from tbl_task_statuses`,
        selectTags: `SELECT tag_id as tagId, name as tag from tbl_task_tags`,
        selectTasks: `
            SELECT pt.task_id    AS taskId,
                   pt.project_id AS projectId,
                   pt.name,
                   pt.description,
                   ts.status_id  AS statusId,
                   ts.name       AS status,
                   u.user_id     AS userId,
                   u.username    AS username
            FROM (SELECT task_id, project_id, name, description, status_id, assign_user_id
                  FROM tbl_project_tasks
                  WHERE project_id = ?) AS pt
                     LEFT JOIN tbl_users u ON u.user_id = pt.assign_user_id
                     LEFT JOIN tbl_task_statuses ts ON ts.status_id = pt.status_id`,
        selectTagsOfProjects: `
            SELECT pt.task_id AS taskId,
                   ttg.tag_id AS tagId,
                   ttg.name   AS tag
            FROM (SELECT task_id FROM tbl_project_tasks WHERE project_id = ?) AS pt
                     JOIN tbl_tags_of_tasks tt ON tt.task_id = pt.task_id
                     JOIN tbl_task_tags ttg ON ttg.tag_id = tt.tag_id`
    },
    createSql: {
        insertTaskStatus: `
            INSERT INTO tbl_task_statuses(name)
            VALUES (?)`,
        insertTask: `
            INSERT INTO tbl_project_tasks(name, project_id, description, status_id, assign_user_id)
            VALUES (?, ?, ?, ?, ?)`,
        getInsertTagsSql: (taskId: number, tagIds: number[]): string => {
            const values = tagIds.map((tagId) => `(${[taskId, tagId]})`);
            return `
                INSERT INTO tbl_tags_of_tasks (task_id, tag_id)
                VALUES ${values}`;
        }
    },
    updateSql: {
        updateTaskStatus: `
            UPDATE tbl_task_statuses
            SET name = ?
            WHERE status_id = ?`,
        getUpdateTaskCommon: (taskData: Partial<TTaskEditCommon>): string => {
            const { taskId, projectId, name, description, statusId, assignUserId } = taskData;
            const values = concat([
                name ? "name = '" + name.trim() + "'" : '',
                statusId ? 'status_id = ' + statusId : '',
                description !== undefined ? "description = '" + description.trim() + "'" : '',
                assignUserId ? 'assign_user_id = ' + assignUserId : ''
            ]);
            return (
                values
                && `
                UPDATE tbl_project_tasks
                SET ${values}
                WHERE project_id = ${projectId}
                  AND task_id = ${taskId}`
            );
        },
        getUpdateTagsSql: (
            taskId: number,
            tagIds?: number[],
            deleteTagIds?: number[]
        ): TUpdateDependentSql => {
            const insertSql = tagIds && [TASK_SQL.createSql.getInsertTagsSql(taskId, tagIds)];
            const deleteSql
                = deleteTagIds
                && `
                  DELETE
                  FROM tbl_tags_of_tasks
                  WHERE task_id = ${taskId}
                    AND tag_id IN (${deleteTagIds})`;

            return [insertSql, deleteSql];
        }
    }
};
