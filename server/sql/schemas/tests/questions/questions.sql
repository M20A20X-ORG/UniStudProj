USE `unistudproj`;

DROP TABLE IF EXISTS `tbl_questions`;
CREATE TABLE `tbl_questions`
(
    `question_id`  INT AUTO_INCREMENT,
    `type_id`      INT          NOT NULL,
    `prog_lang_id` INT          NOT NULL,
    `result`       VARCHAR(100) NOT NULL,
    `question`     VARCHAR(100) NOT NULL,
    `init_value`   VARCHAR(300) NOT NULL,
    `regex_group`  VARCHAR(300) NULL,
    `regex`        VARCHAR(300) NULL,
    CONSTRAINT `questions_PK_question_id` PRIMARY KEY (`question_id`),
    CONSTRAINT `questions_FK_question_types_type_id` FOREIGN KEY (`type_id`) REFERENCES `tbl_question_types` (`type_id`) ON DELETE RESTRICT,
    CONSTRAINT `questions_FK_question_prog_lang_prog_lang_id` FOREIGN KEY (`prog_lang_id`) REFERENCES `tbl_question_prog_langs` (`prog_lang_id`) ON DELETE RESTRICT
);
