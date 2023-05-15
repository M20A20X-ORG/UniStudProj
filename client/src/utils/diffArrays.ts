export const diffArrays = <T>(array0: T[], array1: T[]): T[] => array0.filter((elem) => !array1.includes(elem));
