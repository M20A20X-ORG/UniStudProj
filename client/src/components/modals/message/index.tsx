import React, { FC, useContext, useEffect, useState } from 'react';
import { TMessage } from 'types/context/modal.context';

import cn from 'classnames';

import { ModalContext } from 'context/Modal.context';

import s from './message.module.scss';

interface MessageModalProps {
    initTime: number;
    message: string;
    type: TMessage;
}

export const MessageModal: FC<MessageModalProps> = (props) => {
    const { message, initTime, type } = props;
    const modalContext = useContext(ModalContext);

    /// ----- State ----- ///
    const initialTime = initTime * 2;
    const [timeLeft, setTimeLeft] = useState<number>(initialTime);
    const [isMouseOver, setMouseOver] = useState<boolean>(false);

    /// ----- componentDidMount ----- ///
    /// ----- componentWillMount ----- ///
    useEffect(() => {
        if (timeLeft < 0) {
            modalContext?.closeModal('message');
            return;
        }
        const interval = setInterval(() => {
            if (!isMouseOver) setTimeLeft(timeLeft - 100);
        }, 50);
        return () => clearInterval(interval);
    }, [timeLeft, isMouseOver]);

    useEffect(() => {
        setTimeLeft(initialTime);
    }, [modalContext?.modalElem.message]);

    return (
        <div className={cn('modal', s.message)}>
            <div
                className={cn(
                    { [s.error]: type === 'error', [s.info]: type === 'info' },
                    'clickable',
                    s.messageContainer
                )}
                onMouseEnter={() => setMouseOver(true)}
                onMouseOut={() => setMouseOver(false)}
                onClick={() => modalContext?.closeModal('message')}
            >
                <span className={s.text}>{message}</span>
                <div
                    style={{ width: (100 * timeLeft) / initialTime + '%' }}
                    className={s.timeBar}
                />
            </div>
        </div>
    );
};
