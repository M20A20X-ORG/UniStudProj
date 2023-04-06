USE `unistudproj`;

DROP TABLE IF EXISTS `tbl_question_prog_langs`;
CREATE TABLE `tbl_question_prog_langs`
(
    `prog_lang_id` INT AUTO_INCREMENT,
    `name`         VARCHAR(30) NOT NULL,
    CONSTRAINT `question_prog_langs_PK_prog_lang_id` PRIMARY KEY (`prog_lang_id`),
    CONSTRAINT `question_prog_langs_UQ_name` UNIQUE (`name`)
);
