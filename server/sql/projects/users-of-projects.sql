USE `unsistudproj`;

DROP TABLE IF EXISTS `tbl_users_of_projects`;
CREATE TABLE `tbl_users_of_projects`
(
    `project_id`      INT,
    `user_id`         INT,
    `project_role_id` INT NULL,
    CONSTRAINT `users_of_projects_PK_project_id_user_id` PRIMARY KEY (`project_id`, `user_id`),
    CONSTRAINT `users_of_projects_FK_projects_project_id` FOREIGN KEY (`project_id`) REFERENCES `tbl_projects` (`project_id`) ON DELETE CASCADE,
    CONSTRAINT `users_of_projects_FK_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`user_id`) ON DELETE CASCADE,
    CONSTRAINT `users_of_projects_FK_project_roles_role_id` FOREIGN KEY (`project_role_id`) REFERENCES `tbl_project_roles` (`role_id`) ON DELETE SET NULL
);
