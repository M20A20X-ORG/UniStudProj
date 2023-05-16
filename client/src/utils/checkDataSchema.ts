import { ErrorObject } from 'ajv/dist/types';
import { validateSchema } from 'utils/validateSchema';

export const checkDataSchema = <T>(data: T, schema: string): ErrorObject | undefined =>
    validateSchema(data, 'http://example.com/schema/' + schema);
