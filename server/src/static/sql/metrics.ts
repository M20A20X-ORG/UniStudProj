import { TMetricsDaily, TMetricsUpdateAction } from '@type/schemas/metrics';
import { METRICS_DB_ID, TASK_COMPLETED_DB_ID, TEST_COMPLETED_DB_STATE } from '@static/common';

export const METRICS_SQL = {
    readSql: {
        selectMetrics: `
        SELECT day_guests            AS dayGuests,
               all_time_guests       AS allTimeGuests,
               day_registrations     AS dayRegistrations,
               day_authorizations    AS dayAuthorizations,
               day_project_creations AS dayProjectCreations,
               day_tests_completions AS dayTestsCompletions,
               day_tasks_completions AS dayTasksCompletions
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
        WHERE status_id = ${TASK_COMPLETED_DB_ID}`,
        selectTestsCompletedAmount: `
        SELECT COUNT(*) AS allTestsCompleted
        FROM tbl_users_need_tests
        WHERE state = '${TEST_COMPLETED_DB_STATE}'`
    },
    updateSql: {
        getUpdateDailyMetrics: (metrics: TMetricsDaily, metricAction: TMetricsUpdateAction) => {
            let value = '';
            switch (metricAction) {
                case 'METRICS_AUTHORIZATION':
                    value = `day_authorizations = ${metrics.dayAuthorizations + 1}`;
                    break;
                case 'METRICS_GUEST':
                    value = `day_guests = ${metrics.dayGuests + 1}`;
                    break;
                case 'METRICS_PROJECT_CREATION':
                    value = `day_project_creations = ${metrics.dayProjectsCreations + 1}`;
                    break;
                case 'METRICS_REGISTRATION':
                    value = `day_registrations = ${metrics.dayRegistrations + 1}`;
                    break;
                case 'METRICS_TASK_COMPLETION':
                    value = `day_tasks_completions = ${metrics.dayTasksCompletions + 1}`;
                    break;
                case 'METRICS_TEST_COMPLETION':
                    value = `day_tests_completions = ${metrics.dayTestsCompletions + 1}`;
                    break;
                default:
                    break;
            }
            return (
                value &&
                `
            UPDATE tbl_metrics
            SET ${value}
            WHERE metrics_id = ${METRICS_DB_ID}`
            );
        }
    }
};
