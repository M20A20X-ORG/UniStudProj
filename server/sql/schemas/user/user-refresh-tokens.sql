USE `unistudproj`;

DROP TABLE IF EXISTS `tbl_user_refresh_tokens`;
CREATE TABLE `tbl_user_refresh_tokens`
(
    `token`       BINARY(36)  NOT NULL,
    `user_id`     INT         NOT NULL,
    `access_ip`   VARCHAR(50) NOT NULL,
    `expire_time` DATETIME    NOT NULL,
    CONSTRAINT `user_refresh_tokens_PK_token` PRIMARY KEY (`token`),
    CONSTRAINT `user_refresh_tokens_FK_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`user_id`) ON DELETE CASCADE,
    CONSTRAINT `user_refresh_tokens_UQ_access_ip` UNIQUE (`access_ip`)
);
