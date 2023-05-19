import { TModifyQueryResponse, TReadQueryResponse } from '@type/sql';
import { TResponse } from '@type/schemas/response';
import { TMetrics, TMetricsUpdateAction } from '@type/schemas/metrics';

import { METRICS_SQL } from '@static/sql/metrics';

import { sqlPool } from '@configs/sqlPoolConfig';
import { log } from '@configs/loggerConfig';

const { readSql, updateSql } = METRICS_SQL;

interface MetricsService {
    getMetrics: () => Promise<TResponse<TMetrics>>;
    updateMetrics: (updateAction: TMetricsUpdateAction) => Promise<TResponse>;
}

class MetricsServiceImpl implements MetricsService {
    public getMetrics = async (): Promise<TResponse<TMetrics>> => {
        const {
            selectMetrics,
            selectUsersAmount,
            selectProjectsAmount,
            selectTasksCompletedAmount
        } = readSql;

        const dbMetricsResponse: TReadQueryResponse = await sqlPool.query(selectMetrics);
        const [[dbMetrics]] = dbMetricsResponse;
        if (!dbMetrics) return { message: `Metrics are not found!` };
        const metrics = dbMetrics as TMetrics;

        const dbUsersAmountResponse: TReadQueryResponse = await sqlPool.query(selectUsersAmount);
        const [[dbUsersAmount]] = dbUsersAmountResponse;
        if (!dbUsersAmount) return { message: `User metrics are not found!` };
        const { allUsers } = dbUsersAmount as Pick<TMetrics, 'allUsers'>;
        metrics.allUsers = allUsers;

        const dbProjectsAmountResponse: TReadQueryResponse = await sqlPool.query(
            selectProjectsAmount
        );
        const [[dbProjectsAmount]] = dbProjectsAmountResponse;
        if (!dbProjectsAmount) return { message: `Project metrics are not found!` };
        const { allProjects } = dbProjectsAmount as Pick<TMetrics, 'allProjects'>;
        metrics.allProjects = allProjects;

        const dbTasksCompletedAmountResponse: TReadQueryResponse = await sqlPool.query(
            selectTasksCompletedAmount
        );
        const [[dbTasksCompletedAmount]] = dbTasksCompletedAmountResponse;
        if (!dbProjectsAmount) return { message: `Task metrics are not found!` };
        const { allTasksCompleted } = dbTasksCompletedAmount as Pick<TMetrics, 'allTasksCompleted'>;
        metrics.allTasksCompleted = allTasksCompleted;

        return {
            message: `Successfully got metrics`,
            payload: metrics
        };
    };

    public updateMetrics = async (updateAction: TMetricsUpdateAction): Promise<TResponse> => {
        const { getUpdateDailyMetrics } = updateSql;

        const { payload: metrics } = await this.getMetrics();

        const insertMetricsSql = getUpdateDailyMetrics(metrics as TMetrics, updateAction);
        if (!insertMetricsSql) return { message: `Incorrect updateAction: '${updateAction}'` };

        const dbMetricsUpdateResponse: TModifyQueryResponse = await sqlPool.query(insertMetricsSql);
        log.debug(dbMetricsUpdateResponse);

        return { message: `Successfully updated metrics` };
    };
}

export const metricsService = new MetricsServiceImpl();
