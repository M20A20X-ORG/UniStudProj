export const getDbDate = (date = new Date()): string =>
    date.toISOString().slice(0, -5).replace('T', ' ');
