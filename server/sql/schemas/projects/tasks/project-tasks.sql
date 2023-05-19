USE `unistudproj`;

DROP TABLE IF EXISTS `tbl_project_tasks`;
CREATE TABLE `tbl_project_tasks`
(
    `task_id`        INT AUTO_INCREMENT,
    `project_id`     INT NOT NULL,
    `name`           VARCHAR(30)  NOT NULL,
    `description`    VARCHAR(200) NOT NULL,
    `status_id`      INT          NULL,
    `assign_user_id` INT          NULL,
    CONSTRAINT `project_tasks_PK_task_id` PRIMARY KEY (`task_id`),
    CONSTRAINT `project_tasks_UQ_task_name` UNIQUE (`name`),
    CONSTRAINT `project_tasks_FK_projects_projects_id` FOREIGN KEY (`project_id`) REFERENCES `tbl_projects` (`project_id`) ON DELETE CASCADE,
    CONSTRAINT `project_tasks_FK_task_statuses_status_id` FOREIGN KEY (`status_id`) REFERENCES `tbl_task_statuses` (`status_id`) ON DELETE SET NULL,
    CONSTRAINT `project_tasks_FK_users_user_id` FOREIGN KEY (`assign_user_id`) REFERENCES `tbl_users` (`user_id`) ON DELETE SET NULL
);
