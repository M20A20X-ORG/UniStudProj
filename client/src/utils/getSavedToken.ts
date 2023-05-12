type TToken = 'access-token' | 'refresh-token';

export const getSavedToken = (type: TToken): string => {
    let value = localStorage.getItem(type) || '';
    if (value && type === 'access-token') value = 'Bearer ' + value;
    return value;
};
