import React, { FC, JSX, ReactNode, ReactPortal, useEffect, useState } from 'react';
import { TMessage, TModal } from 'types/context/modal.context';

import { createPortal } from 'react-dom';

import { DEFAULT_MSG_TIME } from 'assets/static/common';

import { ModalContext } from 'context/Modal.context';

import { MessageModal } from 'components/modals/message';

type TModalState = { [key in TModal]: ReactPortal | null };

interface ModalProviderProps {
    children: ReactNode;
}

export const ModalProvider: FC<ModalProviderProps> = (props) => {
    const { children } = props;
    const [modalElem, setModalElem] = useState<TModalState>({ custom: null, message: null });

    /// ----- Handlers ----- ///
    const closeModal = (type: TModal): void => setModalElem((prevState) => ({ ...prevState, [type]: null }));

    const openModal = (ModalElem: JSX.Element, type: TModal): void => {
        const portal = createPortal(ModalElem, document.body);
        setModalElem((prevState) => ({ ...prevState, [type]: portal }));
    };

    const openMessageModal = (message: string, type: TMessage, initTime = DEFAULT_MSG_TIME): void => {
        openModal(
            <MessageModal
                initTime={initTime}
                message={message}
                type={type}
            />,
            'message'
        );
    };

    /// ----- componentDidMount ----- ///
    useEffect(() => {
        document.onkeydown = (event) => {
            if (event.key === 'Escape') closeModal('custom');
        };
    }, []);

    return (
        <ModalContext.Provider
            value={{
                openModal,
                closeModal,
                openMessageModal,
                modalElem
            }}
        >
            {children}
        </ModalContext.Provider>
    );
};
