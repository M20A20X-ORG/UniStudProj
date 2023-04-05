USE `unistudproj`;

DROP TABLE IF EXISTS `tbl_tags_of_tasks`;
CREATE TABLE `tbl_tags_of_tasks`
(
    `task_id` INT,
    `tag_id`  INT,
    CONSTRAINT `tags_of_tasks_PK_task_id_tag_id` PRIMARY KEY (`task_id`, `tag_id`),
    CONSTRAINT `tags_of_tasks_FK_project_tasks_task_id` FOREIGN KEY (`task_id`) REFERENCES `tbl_project_tasks` (`task_id`) ON DELETE CASCADE,
    CONSTRAINT `tags_of_tasks_FK_projects_project_id` FOREIGN KEY (`tag_id`) REFERENCES `tbl_task_tags` (`tag_id`) ON DELETE CASCADE
);
