export const getIsoDate = (): string => new Date().toISOString().replace(/:/g, '-');
