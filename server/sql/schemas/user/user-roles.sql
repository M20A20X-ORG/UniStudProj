USE `unistudproj`;

DROP TABLE IF EXISTS `tbl_user_roles`;
CREATE TABLE `tbl_user_roles`
(
    `role_id` INT AUTO_INCREMENT,
    `name`    VARCHAR(15) NOT NULL,
    CONSTRAINT `user_roles_PK_role_id` PRIMARY KEY (`role_id`),
    CONSTRAINT `user_roles_UQ_name` UNIQUE (`name`)
);
