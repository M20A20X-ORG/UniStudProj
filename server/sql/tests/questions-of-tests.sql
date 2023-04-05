USE `unistudproj`;

DROP TABLE IF EXISTS `tbl_questions_of_tests`;
CREATE TABLE `tbl_questions_of_tests`
(
    `test_id`     INT,
    `question_id` INT,
    CONSTRAINT `questions_of_tests_PK_test_id_question_id` PRIMARY KEY (`test_id`, `question_id`),
    CONSTRAINT `questions_of_tests_FK_tests_test_id` FOREIGN KEY (`test_id`) REFERENCES `tbl_tests` (`test_id`) ON DELETE CASCADE,
    CONSTRAINT `questions_of_tests_FK_questions_question_id` FOREIGN KEY (`question_id`) REFERENCES `tbl_questions` (`question_id`) ON DELETE RESTRICT
);
