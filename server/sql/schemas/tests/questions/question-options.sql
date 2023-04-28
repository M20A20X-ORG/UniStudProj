USE `unistudproj`;

DROP TABLE IF EXISTS `tbl_question_options`;
CREATE TABLE `tbl_question_options`
(
    `option_id`   INT AUTO_INCREMENT,
    `question_id` INT          NOT NULL,
    `text`        VARCHAR(30)  NULL,
    `image_url`   VARCHAR(200) NULL,
    CONSTRAINT `question_options_PK_option_id` PRIMARY KEY (`option_id`),
    CONSTRAINT `question_options_FK_questions_question_id` FOREIGN KEY (`question_id`) REFERENCES `tbl_questions` (`question_id`) ON DELETE CASCADE
);
