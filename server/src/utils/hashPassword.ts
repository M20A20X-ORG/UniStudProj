import { genSaltSync, hashSync } from 'bcrypt';

export const hashPassword = (password: string): string => {
    const salt = genSaltSync();
    return hashSync(password, salt);
};
