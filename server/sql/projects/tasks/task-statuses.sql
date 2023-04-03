USE `unsistudproj`;

DROP TABLE IF EXISTS `tbl_task_statuses`;
CREATE TABLE `tbl_task_statuses`
(
    `status_id` INT,
    `name`      VARCHAR(30) NOT NULL,
    CONSTRAINT `task_statuses_PK_status_id` PRIMARY KEY (`status_id`),
    CONSTRAINT `task_statuses_UQ_name` UNIQUE (`name`)
);
