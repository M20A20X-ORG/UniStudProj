USE `unistudproj`;

DROP TABLE IF EXISTS `tbl_options_of_questions`;
CREATE TABLE `tbl_options_of_questions`
(
    `question_id` INT,
    `option_id`   INT,
    CONSTRAINT `options_of_questions_PK_question_id_option_id` PRIMARY KEY (`question_id`, `option_id`),
    CONSTRAINT `options_of_questions_FK_questions_question_id` FOREIGN KEY (`question_id`) REFERENCES `tbl_questions` (`question_id`) ON DELETE CASCADE,
    CONSTRAINT `options_of_questions_FK_question_options_option_id` FOREIGN KEY (`option_id`) REFERENCES `tbl_question_options` (`option_id`) ON DELETE RESTRICT
);
