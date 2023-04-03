USE `unsistudproj`;

DROP TABLE IF EXISTS `tbl_news`;
CREATE TABLE `tbl_news`
(
    `news_id`   INT,
    `author_id` INT          NULL,
    `heading`   VARCHAR(50)  NOT NULL,
    `text`      VARCHAR(500) NOT NULL,
    CONSTRAINT `news_PK_news_id` PRIMARY KEY (`news_id`),
    CONSTRAINT `news_UQ_name` UNIQUE (`heading`),
    CONSTRAINT `news_FK_users_user_id` FOREIGN KEY (`author_id`) REFERENCES `tbl_users` (`user_id`) ON DELETE SET NULL
);
