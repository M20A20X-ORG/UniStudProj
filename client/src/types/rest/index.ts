import { TMessage } from 'types/context/modal.context';

export type TFuncResponse<T = undefined> = { message: string; type: TMessage; payload?: T };
