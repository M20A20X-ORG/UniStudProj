USE `unistudproj`;

DROP TABLE IF EXISTS `tbl_projects`;
CREATE TABLE `tbl_projects`
(
    `project_id`          INT AUTO_INCREMENT,
    `name`                VARCHAR(30)  NOT NULL,
    `participants_amount` INT          NOT NULL,
    `description`         VARCHAR(200) NULL,
    `data_start`          DATE         NULL,
    `data_end`            DATE         NULL,
    CONSTRAINT `projects_PK_project_id` PRIMARY KEY (`project_id`),
    CONSTRAINT `projects_UQ_name` UNIQUE (`name`)
);
