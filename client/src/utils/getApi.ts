import { API_ROOT, API_URL } from 'assets/static/url';

export const getApi = (endpoint: keyof typeof API_URL) => API_ROOT + API_URL[endpoint];
