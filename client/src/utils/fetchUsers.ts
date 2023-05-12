import { TUser } from 'types/rest/responses/auth';
import { TServerResponse } from 'types/rest/responses/serverResponse';
import { TFuncResponse } from 'types/rest';

import { concat } from 'utils/concat';
import { validateSchema } from 'utils/validateSchema';
import { getApi } from 'utils/getApi';

export const fetchUsers = async (userIds: number[], limit?: number): Promise<TFuncResponse<TUser[]>> => {
    const params = limit
        ? 'limit=' + limit
        : concat(
              userIds.map((id) => `userIdentifiers[]=${id}`),
              '&',
              false
          );
    const query = getApi('getUsers') + '?' + params;

    try {
        const response = await fetch(query);
        if (response.status === 500) return { message: response.statusText, type: 'error' };
        const json = (await response.json()) as TServerResponse<TUser[]>;

        const message = json?.message || response.statusText;
        const { payload: usersData } = json || {};

        if (!response.ok) return { message, type: 'error' };

        let validationErrorMessage: string | undefined;
        const isPayloadValid =
            Array.isArray(usersData) &&
            usersData.every((elem) => {
                const validationResult = validateSchema(elem, 'http://example.com/schema/user');
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
            payload: usersData as TUser[]
        };
    } catch (error: unknown) {
        const { message } = error as Error;
        return { message, type: 'error' };
    }
};
