export type TMetricsCommon = {
    dayGuests: number;
    dayRegistrations: number;
    dayAuthorizations: number;
    dayProjectsCreations: number;
    dayTestsCompletions: number;
    dayTasksCompletions: number;
    allTimeGuests: number;
};

export type TMetricsSchemas = {
    allUsers: number;
    allProjects: number;
    allTestsCompleted: number;
    allTasksCompleted: number;
};

export type TMetrics = TMetricsCommon & TMetricsSchemas;

export type TMetricsUpdateAction =
    | 'METRICS_GUEST'
    | 'METRICS_REGISTRATION'
    | 'METRICS_AUTHORIZATION'
    | 'METRICS_PROJECT_CREATION'
    | 'METRICS_TEST_COMPLETION'
    | 'METRICS_TASK_COMPLETION';
