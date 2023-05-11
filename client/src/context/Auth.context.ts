import { TAuthContext } from 'types/context/auth.context';
import { createContext } from 'react';

export const AuthContext = createContext<TAuthContext | null>(null);
