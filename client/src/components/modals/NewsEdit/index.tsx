import React, { Dispatch, FC, SetStateAction, useContext } from 'react';
import { TNews } from 'types/rest/responses/news';
import { TNewsEdit, TNewsJson } from 'types/rest/requests/news';

import { ModalContext } from 'context/Modal.context';
import { AuthContext } from 'context/Auth.context';

import cn from 'classnames';
import { request } from 'utils/request';

import { NewsConstructorForm, TNewsFormData } from 'components/templates/NewsConstructorForm';

import s from './NewsEdit.module.scss';

interface NewsEditProps {
    initData: TNews;
    editSubmittedState: [boolean, Dispatch<SetStateAction<boolean>>];
}

export const NewsEditForm: FC<NewsEditProps> = (props) => {
    const {
        editSubmittedState: [editToggle, toggleEdit],
        initData
    } = props;

    const authContext = useContext(AuthContext);
    const modalContext = useContext(ModalContext);

    const handleFormSubmit = async (formData: TNewsFormData): Promise<void> => {
        if (!authContext?.userId)
            return modalContext?.openMessageModal("Can't create news - user is not authorized!", 'error');

        const data: TNewsJson<TNewsEdit> = {
            news: { newsId: initData.newsId, authorId: authContext.userId, ...formData }
        };

        const { message, type } = await request('editNews', { method: 'PUT', dataRaw: data });

        modalContext?.openMessageModal(message, type);
        if (type === 'info') modalContext?.closeModal('custom');
        toggleEdit(!editToggle);
    };

    const handleBtnDeleteClick = async (newsId: number): Promise<void> => {
        const { message, type } = await request('deleteNews', {
            method: 'DELETE',
            params: [['newsId', newsId]]
        });
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
                    <h2>Edit news</h2>
                    <NewsConstructorForm
                        handleFormSubmit={handleFormSubmit}
                        actionType={'edit'}
                        initData={initData}
                    />
                    <button
                        className={cn('btn', 'clickable', s.btn)}
                        onClick={() => handleBtnDeleteClick(initData.newsId)}
                    >
                        Delete
                    </button>
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
