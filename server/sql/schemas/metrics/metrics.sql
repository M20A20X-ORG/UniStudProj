USE `unistudproj`;

DROP TABLE IF EXISTS `tbl_metrics`;
CREATE TABLE `tbl_metrics`
(
    `metrics_id`            INT,
    `day_guests`            INT NOT NULL DEFAULT 0,
    `all_time_guests`       INT NOT NULL DEFAULT 0,
    `day_registrations`     INT NOT NULL DEFAULT 0,
    `day_authorizations`    INT NOT NULL DEFAULT 0,
    `day_project_creations` INT NOT NULL DEFAULT 0,
    `day_tests_completions` INT NOT NULL DEFAULT 0,
    `day_tasks_completions` INT NOT NULL DEFAULT 0,
    CONSTRAINT `metrics_PK_metrics_id` PRIMARY KEY (`metrics_id`)
);
