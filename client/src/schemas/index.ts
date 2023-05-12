import { TSchema } from 'types/rest/responses/schema';

import { userSchema } from './user';
import { tagSchema } from './tag';
import { projectSchema } from './project';

export const SCHEMAS: TSchema = {
    userSchema,
    tagSchema,
    projectSchema
};
