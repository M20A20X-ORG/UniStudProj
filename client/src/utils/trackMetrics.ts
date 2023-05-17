import { TMetricsUpdateAction } from 'types/rest/requests/metrics';
import { TFuncResponse } from 'types/rest';
import { request } from 'utils/request';

export const trackMetrics = async (action: TMetricsUpdateAction): Promise<TFuncResponse | void> => {
    const { message, type } = await request('getProject', { method: 'PUT', params: [['action', action]] });
    if (type === 'error') return { message, type };
};
