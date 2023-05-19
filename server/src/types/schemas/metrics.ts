export type TMetrics = {
    allTimeGuests: number;
    allUsers: number;
    allProjects: number;
    allTasksCompleted: number;
};

export type TMetricsUpdateAction =
    | 'METRICS_GUEST'
    | 'METRICS_PROJECT_CREATION'
    | 'METRICS_TASK_COMPLETION';
