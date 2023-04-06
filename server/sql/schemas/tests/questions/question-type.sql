USE `unistudproj`;

DROP TABLE IF EXISTS `tbl_question_types`;
CREATE TABLE `tbl_question_types`
(
    `type_id` INT AUTO_INCREMENT,
    `name`    VARCHAR(30) NOT NULL,
    CONSTRAINT `question_types_PK_type_id` PRIMARY KEY (`type_id`),
    CONSTRAINT `question_types_UQ_name` UNIQUE (`name`)
);
