import { JSX, ReactPortal } from 'react';

export type TModal = 'custom' | 'message';
export type TMessage = 'error' | 'info';

export type TOpenModal = (component: JSX.Element, type: TModal) => void;
export type TOpenMessageModal = (message: string,type:TMessage, timeInit?: number) => void;
export type TCloseModal = (type: TModal) => void;

export type TModalContext = {
    openModal: TOpenModal;
    closeModal: TCloseModal;
    openMessageModal: TOpenMessageModal;
    modalElem: { [key in TModal]: ReactPortal | null };
};
