import { TMetrics, TMetricsUpdateAction } from '@type/schemas/metrics';
import { METRICS_DB_ID, TASK_COMPLETED_DB_ID } from '@static/common';

export const METRICS_SQL = {
    readSql: {
        selectMetrics: `
            SELECT all_guests AS allTimeGuests
            FROM tbl_metrics
            WHERE metrics_id = ${METRICS_DB_ID}`,
        selectUsersAmount: `
            SELECT COUNT(*) AS allUsers
            FROM tbl_users`,
        selectProjectsAmount: `
            SELECT COUNT(*) AS allProjects
            FROM tbl_projects`,
        selectTasksCompletedAmount: `
            SELECT COUNT(*) AS allTasksCompleted
            FROM tbl_project_tasks
            WHERE status_id = ${TASK_COMPLETED_DB_ID}`
    },
    updateSql: {
        getUpdateDailyMetrics: (metrics: TMetrics, metricAction: TMetricsUpdateAction): string => {
            let value = '';
            if (metricAction === 'METRICS_GUEST') {
                value = `all_guests = ${metrics.allTimeGuests + 1}`;
            }
            return (
                value
                && `
                  UPDATE tbl_metrics
                  SET ${value}
                  WHERE metrics_id = ${METRICS_DB_ID}`
            );
        }
    }
};
