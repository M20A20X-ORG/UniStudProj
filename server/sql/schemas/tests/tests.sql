USE `unistudproj`;

DROP TABLE IF EXISTS `tbl_tests`;
CREATE TABLE `tbl_tests`
(
    `test_id`          INT AUTO_INCREMENT,
    `name`             VARCHAR(30) NOT NULL,
    `time_limit`       INT         NOT NULL,
    `questions_amount` INT         NOT NULL,
    `date_start`       DATE        NULL,
    `date_end`         DATE        NULL,
    CONSTRAINT `tests_PK_test_id` PRIMARY KEY (`test_id`),
    CONSTRAINT `users_UQ_name` UNIQUE (`name`)
);
