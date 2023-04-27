USE `unistudproj`;

DROP TABLE IF EXISTS `tbl_users_need_tests`;
CREATE TABLE `tbl_users_need_tests`
(
    `test_id`      INT,
    `user_id`      INT,
    `project_id`   INT,
    `is_started`   BOOLEAN NOT NULL DEFAULT FALSE,
    `is_completed` BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT `users_need_tests_PK_test_id_user_id_project_id` PRIMARY KEY (`test_id`, `user_id`, `project_id`),
    CONSTRAINT `users_need_tests_FK_tests_test_id` FOREIGN KEY (`test_id`) REFERENCES `tbl_tests` (`test_id`) ON DELETE CASCADE,
    CONSTRAINT `users_need_tests_FK_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`user_id`) ON DELETE CASCADE,
    CONSTRAINT `users_need_tests_FK_projects_project_id` FOREIGN KEY (`project_id`) REFERENCES `tbl_projects` (`project_id`) ON DELETE CASCADE
);
