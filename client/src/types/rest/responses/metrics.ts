export type TMetricsCommon = {
    dayGuests: number;
    dayRegistrations: number;
    dayAuthorizations: number;
    dayProjectsCreations: number;
    dayTasksCompletions: number;
    allTimeGuests: number;
};

export type TMetricsSchemas = {
    allUsers: number;
    allProjects: number;
    allTasksCompleted: number;
};

export type TMetrics = TMetricsCommon & TMetricsSchemas;
