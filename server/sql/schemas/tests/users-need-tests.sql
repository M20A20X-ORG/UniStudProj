USE `unistudproj`;

DROP TABLE IF EXISTS `tbl_users_need_tests`;
CREATE TABLE `tbl_users_need_tests`
(
    `test_id`        INT,
    `user_id`        INT,
    `project_id`     INT,
    `state`          VARCHAR(30) NOT NULL DEFAULT 'TEST_NOT_PASSED',
    `score`          INT         NOT NULL DEFAULT 0,
    `date_started`   DATETIME    NULL,
    `date_completed` DATETIME    NULL,
    CONSTRAINT `users_need_tests_PK_test_id_user_id_project_id` PRIMARY KEY (`test_id`, `user_id`, `project_id`),
    CONSTRAINT `users_need_tests_FK_tests_test_id` FOREIGN KEY (`test_id`) REFERENCES `tbl_tests` (`test_id`) ON DELETE CASCADE,
    CONSTRAINT `users_need_tests_FK_users_of_projects_user_id_project_id` FOREIGN KEY (`user_id`, `project_id`) REFERENCES `tbl_users_of_projects` (`user_id`, `project_id`) ON DELETE CASCADE,
    CONSTRAINT `users_need_tests_FK_tests_of_projects_test_id_project_id` FOREIGN KEY (`test_id`, `project_id`) REFERENCES `tbl_tests_of_projects` (`test_id`, `project_id`) ON DELETE CASCADE
);
