export const PAGE_URL = {
    root: '/',
    main: 'main',
    about: 'about',
    projects: 'projects',
    profile: 'profile',
    tests: 'tests',
    news: 'news',
    metrics: 'metrics'
};

export const API_ROOT = 'http://localhost:8000/';
export const API_URL = {
    login: 'auth/login',
    registerUser: 'users/register',
    getUsers: 'users/get',
    editUser: 'users/edit',
    createProject: 'projects/create',
    getProject: 'projects/get',
    editProject: 'projects/edit',
    getProjectTags: 'projects/tags/get',
    createProjectTask: 'projects/tasks/create',
    getProjectTasks: 'projects/tasks/get',
    editProjectTask: 'projects/tasks/edit',
    deleteProjectTask: 'projects/tasks/delete',
    getProjectTasksStatuses: 'projects/tasks/get/statuses',
    getProjectTasksTags: 'projects/tasks/get/tags',
    uploadResource: 'resources/create'
};
