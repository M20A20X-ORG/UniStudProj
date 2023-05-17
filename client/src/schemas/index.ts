import { TSchema } from 'types/rest/responses/schema';

import { userLoginSchema } from './login';
import { userSchema } from './user';
import { tagSchema } from './tag';
import { projectSchema } from './project';
import { projectTaskSchema } from './projectTask';
import { projectTaskStatusSchema } from './projectTaskStatus';
import { newsSchema } from './news';
import { metricsSchema } from './metrics';

export const SCHEMAS: TSchema = {
    userLoginSchema,
    userSchema,
    tagSchema,
    projectSchema,
    projectTaskSchema,
    projectTaskStatusSchema,
    newsSchema,
    metricsSchema
};
