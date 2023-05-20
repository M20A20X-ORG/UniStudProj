USE `unistudproj`;

DROP TABLE IF EXISTS `tbl_users`;
CREATE TABLE `tbl_users`
(
    `user_id`  INT AUTO_INCREMENT,
    `role_id`  INT          NOT NULL,
    `name`     VARCHAR(30)  NOT NULL,
    `img_url`  VARCHAR(200) NULL,
    `email`    VARCHAR(30)  NOT NULL,
    `password` VARCHAR(60)  NOT NULL,
    `username` VARCHAR(30)  NOT NULL,
    `about`    VARCHAR(200) NOT NULL,
    `group`    VARCHAR(30)  NOT NULL,
    CONSTRAINT `users_PK_user_id` PRIMARY KEY (`user_id`),
    CONSTRAINT `users_FK_user_roles_role_id` FOREIGN KEY (`role_id`) REFERENCES `tbl_user_roles` (`role_id`) ON DELETE RESTRICT,
    CONSTRAINT `users_UQ_email` UNIQUE (`email`),
    CONSTRAINT `users_UQ_username` UNIQUE (`username`)
);
