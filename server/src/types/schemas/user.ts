export type TUserAuth = {
    username: string;
    password: string;
};

export type TUser = TUserAuth & {
    name: string;
    email: string;
    about?: string;
    group: string;
};

type TUserId = { userId: number };

export type TUserDB = TUser & TUserId;
export type TUserDBPartial = Partial<TUser> & TUserId;
