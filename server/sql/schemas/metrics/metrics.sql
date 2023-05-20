USE `unistudproj`;

DROP TABLE IF EXISTS `tbl_metrics`;
CREATE TABLE `tbl_metrics`
(
    `metrics_id`            INT,
    `all_guests`            INT NOT NULL DEFAULT 0
);
