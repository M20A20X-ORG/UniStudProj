USE `unsistudproj`;

DROP TABLE IF EXISTS `tbl_project_tags`;
CREATE TABLE `tbl_project_tags`
(
    `tag_id` INT,
    `name`   VARCHAR(30) NOT NULL,
    CONSTRAINT `project_tags_PK_tag_id` PRIMARY KEY (`tag_id`),
    CONSTRAINT `project_tags_UQ_name` UNIQUE (`name`)
);
