import { TServerResponse } from 'types/rest/responses/serverResponse';
import { TFuncResponse } from 'types/rest';

import { API_URL } from 'assets/static/url';

import { concat } from 'utils/concat';
import { validateSchema } from 'utils/validateSchema';
import { getApi } from 'utils/getApi';

export const fetchUrl = async <T>(
    api: keyof typeof API_URL,
    param: string,
    ids: number[],
    schema: string,
    limit?: number
): Promise<TFuncResponse<T[]>> => {
    const params = limit
        ? 'limit=' + limit
        : concat(
              ids.map((id) => `${param}[]=${id}`),
              '&',
              false
          );
    const query = getApi(api) + '?' + params;

    try {
        const response = await fetch(query);
        if (response.status === 500) return { message: response.statusText, type: 'error' };
        const json = (await response.json()) as TServerResponse<T[]>;

        const message = json?.message || response.statusText;
        if (!response.ok) return { message, type: 'error' };

        const { payload } = json || {};
        const data = payload || [];

        let validationErrorMessage: string | undefined;
        const isPayloadValid =
            Array.isArray(data) &&
            data.every((elem) => {
                const validationResult = validateSchema(elem, 'http://example.com/schema/' + schema);
                if (validationResult) {
                    validationErrorMessage = validationResult?.message;
                    return false;
                }
            });
        if (isPayloadValid) {
            return {
                message: `Incorrect response from server: ${validationErrorMessage}`,
                type: 'error'
            };
        }

        return {
            message,
            type: 'info',
            payload: data as T[]
        };
    } catch (error: unknown) {
        const { message } = error as Error;
        return { message, type: 'error' };
    }
};
