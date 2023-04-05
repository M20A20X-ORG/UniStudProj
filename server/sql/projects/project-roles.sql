USE `unistudproj`;

DROP TABLE IF EXISTS `tbl_project_roles`;
CREATE TABLE `tbl_project_roles`
(
    `role_id` INT,
    `name`    VARCHAR(30) NOT NULL,
    CONSTRAINT `project_roles_PK_role_id` PRIMARY KEY (`role_id`),
    CONSTRAINT `project_roles_UQ_name` UNIQUE (`name`)
);
