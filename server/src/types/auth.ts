export type TUserAccessRole = 'ROLE_ADMINISTRATOR' | 'ROLE_USER';
export type TProjectAccessRole =
    | 'ROLE_PROJECT_OWNER'
    | 'ROLE_PROJECT_MANAGER'
    | 'ROLE_PROJECT_MENTOR'
    | 'ROLE_PROJECT_DEVELOPER';

export type TAccessRole<T> = { [key: string]: T };
