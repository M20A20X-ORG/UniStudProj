USE `unsistudproj`;

DROP TABLE IF EXISTS `tbl_tags_of_projects`;
CREATE TABLE `tbl_tags_of_projects`
(
    `project_id` INT,
    `tag_id`    INT,
    CONSTRAINT `tags_of_projects_PK_project_id_tag_id` PRIMARY KEY (`project_id`, `tag_id`),
    CONSTRAINT `tags_of_projects_FK_projects_project_id` FOREIGN KEY (`project_id`) REFERENCES `tbl_projects` (`project_id`) ON DELETE CASCADE,
    CONSTRAINT `tags_of_projects_FK_project_tags_tag_id` FOREIGN KEY (`tag_id`) REFERENCES `tbl_project_tags` (`tag_id`) ON DELETE CASCADE
);
