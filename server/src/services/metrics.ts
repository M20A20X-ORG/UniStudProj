import { TPayloadResponse, TResponse } from '@type/schemas/response';
import {
    TMetrics,
    TMetricsDaily,
    TMetricsSchemas,
    TMetricsUpdateAction
} from '@type/schemas/metrics';

import { METRICS_SQL } from '@static/sql/metrics';
import { NoDataError } from '@exceptions/NoDataError';

import { sqlPool } from '@configs/sqlPool';
import { DataModificationError } from '@exceptions/DataModificationError';

const { readSql, updateSql } = METRICS_SQL;

interface MetricsService {
    getMetrics: (needDaily: boolean) => Promise<TPayloadResponse<TMetrics | TMetricsDaily>>;
    updateMetrics: (updateAction: TMetricsUpdateAction) => Promise<TResponse>;
}

class MetricsServiceImpl implements MetricsService {
    public getMetrics = async (
        needDaily: boolean
    ): Promise<TPayloadResponse<TMetrics | TMetricsDaily>> => {
        const {
            selectMetrics,
            selectUsersAmount,
            selectProjectsAmount,
            selectTestsCompletedAmount,
            selectTasksCompletedAmount
        } = readSql;

        const dbMetricsResponse = await sqlPool.query(selectMetrics);
        const [[dbMetrics]] = dbMetricsResponse as any;
        if (!dbMetrics) throw new NoDataError(`Metrics are not found!`);
        const metrics = dbMetrics as TMetrics;

        if (needDaily)
            return {
                message: `Successfully got metrics`,
                payload: metrics
            };

        const dbUsersAmountResponse = await sqlPool.query(selectUsersAmount);
        const [[dbUsersAmount]] = dbUsersAmountResponse as any;
        if (!dbUsersAmount) throw new NoDataError(`Error getting users metrics!`);
        const { allUsers } = dbUsersAmount as Pick<TMetricsSchemas, 'allUsers'>;
        metrics.allUsers = allUsers;

        const dbProjectsAmountResponse = await sqlPool.query(selectProjectsAmount);
        const [[dbProjectsAmount]] = dbProjectsAmountResponse as any;
        if (!dbProjectsAmount) throw new NoDataError(`Error getting projects metrics!`);
        const { allProjects } = dbProjectsAmount as Pick<TMetricsSchemas, 'allProjects'>;
        metrics.allProjects = allProjects;

        const dbTestsCompletedAmountResponse = await sqlPool.query(selectTestsCompletedAmount);
        const [[dbTestsCompletedAmount]] = dbTestsCompletedAmountResponse as any;
        if (!dbTestsCompletedAmount) throw new NoDataError(`Error getting tests metrics!`);
        const { allTestsCompleted } = dbTestsCompletedAmount as Pick<
            TMetricsSchemas,
            'allTestsCompleted'
        >;
        metrics.allTestsCompleted = allTestsCompleted;

        const dbTasksCompletedAmountResponse = await sqlPool.query(selectTasksCompletedAmount);
        const [[dbTasksCompletedAmount]] = dbTasksCompletedAmountResponse as any;
        if (!dbTasksCompletedAmount) throw new NoDataError(`Error getting tasks metrics!`);
        const { allTasksCompleted } = dbTasksCompletedAmount as Pick<
            TMetricsSchemas,
            'allTasksCompleted'
        >;
        metrics.allTasksCompleted = allTasksCompleted;

        return {
            message: `Successfully got metrics`,
            payload: metrics
        };
    };

    public updateMetrics = async (updateAction: TMetricsUpdateAction): Promise<TResponse> => {
        const { getUpdateDailyMetrics } = updateSql;

        try {
            const { payload: metrics } = await this.getMetrics(true);
            const insertMetricsSql = getUpdateDailyMetrics(metrics as TMetricsDaily, updateAction);
            if (!insertMetricsSql)
                throw new DataModificationError(`Incorrect updateAction: '${updateAction}'`);
            await sqlPool.query(insertMetricsSql);
        } catch (error: unknown) {
            throw error;
        }

        return { message: `Successfully updated metrics` };
    };
}

export const metricsService = new MetricsServiceImpl();
