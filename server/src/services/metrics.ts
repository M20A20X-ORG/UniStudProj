import { TReadQueryResponse, TModifyQueryResponse } from '@type/sql';
import { TPayloadResponse, TResponse } from '@type/schemas/response';
import {
    TMetrics,
    TMetricsCommon,
    TMetricsSchemas,
    TMetricsUpdateAction
} from '@type/schemas/metrics';

import { NoDataError } from '@exceptions/NoDataError';
import { DataModificationError } from '@exceptions/DataModificationError';

import { METRICS_SQL } from '@static/sql/metrics';

import { sqlPool } from '@configs/sqlPool';
import { log } from '@configs/logger';

const { readSql, updateSql } = METRICS_SQL;

interface MetricsService {
    getMetrics: (needDaily: boolean) => Promise<TPayloadResponse<TMetrics | TMetricsCommon>>;
    updateMetrics: (updateAction: TMetricsUpdateAction) => Promise<TResponse>;
}

class MetricsServiceImpl implements MetricsService {
    public getMetrics = async (
        isNeedDaily: boolean
    ): Promise<TPayloadResponse<TMetrics | TMetricsCommon>> => {
        const {
            selectMetrics,
            selectUsersAmount,
            selectProjectsAmount,
            selectTestsCompletedAmount,
            selectTasksCompletedAmount
        } = readSql;

        const dbMetricsResponse: TReadQueryResponse = await sqlPool.query(selectMetrics);
        const [[dbMetrics]] = dbMetricsResponse;
        if (!dbMetrics) throw new NoDataError(`Metrics are not found!`);
        const metrics = dbMetrics as TMetrics;

        if (isNeedDaily) {
            return {
                message: `Successfully got metrics`,
                payload: metrics
            };
        }

        const dbUsersAmountResponse: TReadQueryResponse = await sqlPool.query(selectUsersAmount);
        const [[dbUsersAmount]] = dbUsersAmountResponse;
        if (!dbUsersAmount) throw new NoDataError(`Error getting users metrics!`);
        const { allUsers } = dbUsersAmount as Pick<TMetricsSchemas, 'allUsers'>;
        metrics.allUsers = allUsers;

        const dbProjectsAmountResponse: TReadQueryResponse = await sqlPool.query(
            selectProjectsAmount
        );
        const [[dbProjectsAmount]] = dbProjectsAmountResponse;
        if (!dbProjectsAmount) throw new NoDataError(`Error getting projects metrics!`);
        const { allProjects } = dbProjectsAmount as Pick<TMetricsSchemas, 'allProjects'>;
        metrics.allProjects = allProjects;

        const dbTestsCompletedAmountResponse: TReadQueryResponse = await sqlPool.query(
            selectTestsCompletedAmount
        );
        const [[dbTestsCompletedAmount]] = dbTestsCompletedAmountResponse;
        if (!dbTestsCompletedAmount) throw new NoDataError(`Error getting tests metrics!`);
        const { allTestsCompleted } = dbTestsCompletedAmount as Pick<
            TMetricsSchemas,
            'allTestsCompleted'
        >;
        metrics.allTestsCompleted = allTestsCompleted;

        const dbTasksCompletedAmountResponse: TReadQueryResponse = await sqlPool.query(
            selectTasksCompletedAmount
        );
        const [[dbTasksCompletedAmount]] = dbTasksCompletedAmountResponse;
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

        const { payload: metrics } = await this.getMetrics(true);

        const insertMetricsSql = getUpdateDailyMetrics(metrics as TMetricsCommon, updateAction);
        if (!insertMetricsSql)
            throw new DataModificationError(`Incorrect updateAction: '${updateAction}'`);

        const dbMetricsUpdateResponse: TModifyQueryResponse = await sqlPool.query(insertMetricsSql);
        log.debug(dbMetricsUpdateResponse);

        return { message: `Successfully updated metrics` };
    };
}

export const metricsService = new MetricsServiceImpl();
