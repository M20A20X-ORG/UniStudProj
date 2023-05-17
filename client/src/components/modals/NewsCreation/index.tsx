import React, { Dispatch, FC, SetStateAction, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { TNewsCreation, TNewsJson } from 'types/rest/requests/news';

import { ModalContext } from 'context/Modal.context';
import { AuthContext } from 'context/Auth.context';

import cn from 'classnames';
import { request } from 'utils/request';

import { NewsConstructorForm, TNewsFormData } from 'components/templates/NewsConstructorForm';

import s from './NewsCreation.module.scss';

interface NewsCreationProps {
    editSubmittedState: [boolean, Dispatch<SetStateAction<boolean>>];
}

export const NewsCreationForm: FC<NewsCreationProps> = (props) => {
    const {
        editSubmittedState: [editToggle, toggleEdit]
    } = props;

    const authContext = useContext(AuthContext);
    const modalContext = useContext(ModalContext);

    const handleFormSubmit = async (formData: TNewsFormData): Promise<void> => {
        if (!authContext?.userId)
            return modalContext?.openMessageModal("Can't create news - user is not authorized!", 'error');

        const data: TNewsJson<TNewsCreation> = { news: { authorId: authContext.userId, ...formData } };
        const { message, type } = await request('createNews', { method: 'POST', dataRaw: data });

        modalContext?.openMessageModal(message, type);
        if (type === 'info') {
            modalContext?.closeModal('custom');
            toggleEdit(!editToggle);
        }
    };

    return (
        <div className={'modal'}>
            <div className={'modalContainer'}>
                <div className={'formWrapper'}>
                    <h2>Create news</h2>
                    <NewsConstructorForm
                        handleFormSubmit={handleFormSubmit}
                        actionType={'create'}
                    />
                    <button
                        className={cn('btn', 'clickable', s.btn)}
                        onClick={() => modalContext?.closeModal('custom')}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};
