import { loginSchema } from '@schemas/users/loginSchema';
import { registrationSchema } from '@schemas/users/registrationSchema';
import { editSchema } from '@schemas/users/editSchema';

export const USER_SCHEMA = {
    loginSchema,
    registrationSchema,
    editSchema
};
