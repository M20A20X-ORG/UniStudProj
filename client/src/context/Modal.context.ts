import { createContext } from 'react';
import { TModalContext } from 'types/context/modal.context';

export const ModalContext = createContext<TModalContext | null>(null);
