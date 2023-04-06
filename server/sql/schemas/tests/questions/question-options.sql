USE `unistudproj`;

DROP TABLE IF EXISTS `tbl_question_options`;
CREATE TABLE `tbl_question_options`
(
    `option_id` INT AUTO_INCREMENT,
    `text`      VARCHAR(30) NULL,
    `image_url` VARCHAR(30) NULL,
    CONSTRAINT `question_options_PK_option_id` PRIMARY KEY (`option_id`)
);
