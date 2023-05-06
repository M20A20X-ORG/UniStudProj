import { genSaltSync, hashSync } from 'bcrypt';

export const hashPassword = (password: string): string => {
    const salt: string = genSaltSync();
    return hashSync(password, salt);
};
