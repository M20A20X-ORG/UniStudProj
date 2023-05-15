import { TServerResponse } from 'types/rest/responses/serverResponse';
import { TFuncResponse } from 'types/rest';

import { API_URL } from 'assets/static/url';

import { concat } from 'utils/concat';
import { getApi } from 'utils/getApi';
import { checkDataSchema } from 'utils/checkDataSchema';
import { getSavedToken } from 'utils/getSavedToken';

type TInit = {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    dataRaw?: object;
    params?: [string, number][] | number;
    headers?: Record<string, string>;
};

const initRequest = async <T>(
    url: string,
    requestInit: RequestInit,
    responseDataSchema?: string
): Promise<TFuncResponse<T>> => {
    const response = await fetch(url, requestInit);

    if (response.status === 500 || response.status === 404) return { message: response.statusText, type: 'error' };
    if (response.status === 204) return { message: response.statusText, type: 'info' };

    const json = (await response.json()) as TServerResponse<T[]>;

    const message = json?.message || response.statusText;
    if (!response.ok) return { message, type: 'error' };

    const { payload: data } = json || {};

    if (data && responseDataSchema) {
        let validationErrorMessage: string | undefined;
        if (!Array.isArray(data)) validationErrorMessage = JSON.stringify(checkDataSchema(data, responseDataSchema));
        else {
            data.every((elem) => {
                validationErrorMessage = JSON.stringify(checkDataSchema(elem, responseDataSchema));
                return validationErrorMessage;
            });
        }
        if (validationErrorMessage) {
            return {
                message: `Incorrect response from server: ${validationErrorMessage}`,
                type: 'error'
            };
        }
    }

    return { message, type: 'info', payload: data as T };
};

export const request = async <T = undefined>(
    api: keyof typeof API_URL,
    init: TInit,
    schema?: string
): Promise<TFuncResponse<T>> => {
    const { method, dataRaw, headers, params } = init || { method: 'GET', headers: {} };

    let urlParams = '';
    if (params) {
        urlParams =
            '?' +
            (typeof params === 'number'
                ? 'limit=' + params
                : concat(
                      params.map(([key, value]) => `${key}=${value}`),
                      '&',
                      false
                  ));
    }

    const url: string = getApi(api) + urlParams;
    const body = typeof dataRaw === 'object' ? { body: JSON.stringify(dataRaw) } : {};
    const contentHeader: HeadersInit =
        typeof dataRaw === 'object' ? { 'Content-type': 'application/json;charset=utf-8' } : {};

    const requestInit: RequestInit = {
        method,
        headers: {
            authorization: getSavedToken('access-token'),
            ...contentHeader,
            ...headers
        },
        ...body
    };

    try {
        return await initRequest<T>(url, requestInit, schema);
    } catch (error: unknown) {
        const { message } = error as Error;
        return { message, type: 'error' };
    }
};
