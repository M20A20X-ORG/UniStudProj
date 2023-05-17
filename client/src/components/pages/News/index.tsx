import React, { ChangeEvent, FC, JSX, useContext, useEffect, useState } from 'react';
import { TNews } from 'types/rest/responses/news';

import { ACCESS_ROLE } from 'types/rest/responses/auth';
import { OPTIONS_LIMIT } from 'assets/static/common';

import { ModalContext } from 'context/Modal.context';
import { AuthContext } from 'context/Auth.context';

import cn from 'classnames';
import { request } from 'utils/request';

import { NewsCreationForm } from 'components/modals/NewsCreation';
import { NewsEditForm } from 'components/modals/NewsEdit';

import s from './News.module.scss';

const CREATE_NEWS_VALUE = 'create';

export const NewsPage: FC = () => {
    /// ----- Context / State ----- ///
    const modalContext = useContext(ModalContext);
    const authContext = useContext(AuthContext);

    const [newsState, setNewsState] = useState<TNews[]>([]);
    const [editSubmitToggle, toggleEditSubmit] = useState<boolean>(false);

    /// ----- CRUD ----- ///
    const fetchNews = async (): Promise<void> => {
        const {
            message,
            type,
            payload: newsData
        } = await request<TNews[]>('getNews', { method: 'GET', params: OPTIONS_LIMIT }, 'news');
        if (type === 'error' || !newsData) return modalContext?.openMessageModal(message, type);
        setNewsState(newsData);
    };

    /// ----- Render ----- ///
    const renderBtnEditElem = (news: TNews) => {
        const btnElem = (
            <div
                className={s.btnEdit}
                onClick={() => {
                    toggleEditSubmit(true);
                    modalContext?.openModal(
                        <NewsEditForm
                            initData={news}
                            editSubmittedState={[editSubmitToggle, toggleEditSubmit]}
                        />,
                        'custom'
                    );
                }}
            >
                <span className={'clickable'}>Edit</span>
            </div>
        );

        const isVisible = authContext?.role === 'ROLE_ADMINISTRATOR';
        return <>{isVisible ? btnElem : null}</>;
    };

    const renderNewsCard = (news: TNews) => {
        const { newsId, ...newsCommon } = news;
        const commonLiElems: JSX.Element[] = Object.entries(newsCommon).map(([key, value]) => (
            <>
                <span className={'cardKey'}>{key}:</span>
                <span>{value || '--'}</span>
            </>
        ));

        return (
            <>
                <div className={'cardHead'}>
                    <span>News ID: {newsId}</span>
                </div>
                <ul className={cn('cardCommon', s.newsCardCommon)}>{commonLiElems}</ul>
                {renderBtnEditElem(news)}
            </>
        );
    };

    const renderNewsList = (news: TNews[]): JSX.Element[] => {
        return news.map((n) => (
            <li
                key={JSON.stringify(n)}
                className={'sectionLike card'}
            >
                <span>{renderNewsCard(n)}</span>
            </li>
        ));
    };

    /// ----- Handlers ----- ///
    const handleActionSelectChange = (event: ChangeEvent<HTMLSelectElement>): void => {
        const { value } = event.currentTarget;
        event.currentTarget.value = '';
        if (!authContext?.isLoggedIn)
            return modalContext?.openMessageModal("Can't create news - user are not authorized!", 'error');
        if (value === CREATE_NEWS_VALUE) {
            modalContext?.openModal(
                <NewsCreationForm editSubmittedState={[editSubmitToggle, toggleEditSubmit]} />,
                'custom'
            );
        }
    };

    /// ----- componentDidMount ----- ///
    useEffect(() => {
        fetchNews();
    }, [authContext?.isLoggedIn, editSubmitToggle]);

    return (
        <>
            <div>
                <h1 className={s.projectsHeader}>News</h1>
                <div className={s.actionsContainer}>
                    {authContext?.role !== 'ROLE_ADMINISTRATOR' ? null : (
                        <select
                            className={cn(s.actionsSelect, 'clickable')}
                            onChange={handleActionSelectChange}
                        >
                            <option style={{ display: 'none' }} />
                            <option
                                className={s.actionsBtn}
                                value={CREATE_NEWS_VALUE}
                            >
                                Create news
                            </option>
                        </select>
                    )}
                </div>
            </div>
            <ul>{renderNewsList(newsState)}</ul>
        </>
    );
};
