USE `unistudproj`;

DROP TABLE IF EXISTS `tbl_tests_of_projects`;
CREATE TABLE `tbl_tests_of_projects`
(
    `test_id`    INT,
    `project_id` INT,
    CONSTRAINT `tests_of_projects_PK_test_id_project_id` PRIMARY KEY (`test_id`, `project_id`),
    CONSTRAINT `tests_of_projects_FK_tests_test_id` FOREIGN KEY (`test_id`) REFERENCES `tbl_tests` (`test_id`) ON DELETE CASCADE,
    CONSTRAINT `tests_of_projects_FK_projects_project_id` FOREIGN KEY (`project_id`) REFERENCES `tbl_projects` (`project_id`) ON DELETE CASCADE
);
