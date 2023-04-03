USE `unsistudproj`;

DROP TABLE IF EXISTS `tbl_tasks_of_projects`;
CREATE TABLE `tbl_tasks_of_projects`
(
    `project_id` INT,
    `task_id`    INT,
    CONSTRAINT `tasks_of_projects_PK_project_id_task_id` PRIMARY KEY (`project_id`, `task_id`),
    CONSTRAINT `tasks_of_projects_FK_projects_project_id` FOREIGN KEY (`project_id`) REFERENCES `tbl_projects` (`project_id`) ON DELETE CASCADE,
    CONSTRAINT `tasks_of_projects_FK_project_tasks_task_id` FOREIGN KEY (`task_id`) REFERENCES `tbl_project_tasks` (`task_id`) ON DELETE CASCADE
);
