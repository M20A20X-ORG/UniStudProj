USE `unsistudproj`;

DROP TABLE IF EXISTS `tbl_task_tags`;
CREATE TABLE `tbl_task_tags`
(
    `tag_id` INT,
    `name`      VARCHAR(30) NOT NULL,
    CONSTRAINT `task_tags_PK_tag_id` PRIMARY KEY (`tag_id`),
    CONSTRAINT `task_tags_UQ_name` UNIQUE (`name`)
);
