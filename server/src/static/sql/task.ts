export const TASK_SQL = {
    deleteSql: {
        selectTaskName: `SELECT name
                     FROM tbl_project_tasks
                     WHERE project_id = ?
                       AND task_id = ?`,
        deleteTask: `DELETE
                 FROM tbl_project_tasks
                 WHERE project_id = ?
                   AND task_id = ?`,
        deleteTaskTags: `DELETE
                     FROM tbl_tags_of_tasks
                     WHERE task_id = ?`
    },
    createSql: {
        insertTaskStatus: `INSERT INTO tbl_task_statuses(name)
                       VALUES (?)`,
        insertTask: `INSERT INTO tbl_project_tasks(name, project_id, description, status_id, assign_user_id)
                 VALUES (?, ?, ?, ?, ?)`,
        selectNewTaskId: `SELECT LAST_INSERT_ID() as taskId`,
        getInsertTagsSql: (
            taskId: number,
            tagIds: number[]
        ) => `INSERT INTO tbl_tags_of_tasks (task_id, tag_id)
          VALUES ${tagIds.map((tagId) => '(' + taskId + ',' + tagId + ')').toString()}`
    }
};
