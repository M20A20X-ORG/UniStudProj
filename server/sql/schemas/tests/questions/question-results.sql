USE `unistudproj`;

DROP TABLE IF EXISTS `tbl_question_results`;
CREATE TABLE `tbl_question_results`
(
    `question_id` INT,
    `option_id`   INT,
    CONSTRAINT `question_results_PK_option_id` PRIMARY KEY (`question_id`, `option_id`),
    CONSTRAINT `question_results_FK_question_options_question_id_option_id` FOREIGN KEY (`question_id`, `option_id`) REFERENCES `tbl_question_options` (`question_id`, `option_id`) ON DELETE CASCADE
);
