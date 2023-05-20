import React, { FC, JSX, useContext, useEffect, useState } from 'react';
import { TMetrics } from 'types/rest/responses/metrics';

import { ModalContext } from 'context/Modal.context';
import { AuthContext } from 'context/Auth.context';

import { v4 } from 'uuid';
import { request } from 'utils/request';

import s from './Metrics.module.scss';

const METRICS_FALLBACK: Partial<TMetrics> = {
    allTimeGuests: undefined,
    allUsers: undefined,
    allProjects: undefined,
    allTasksCompleted: undefined
};

export const MetricsPage: FC = () => {
    /// ----- Context / State ----- ///
    const modalContext = useContext(ModalContext);
    const authContext = useContext(AuthContext);

    const [metricsState, setMetricsState] = useState<TMetrics | null>(null);

    /// ----- CRUD ----- ///
    const fetchMetrics = async (): Promise<void> => {
        const {
            message,
            type,
            payload: metricsData
        } = await request<TMetrics>('getMetrics', { method: 'GET' }, 'metrics');
        if (type === 'error' || !metricsData) return modalContext?.openMessageModal(message, type);
        setMetricsState(metricsData);
    };

    /// ----- Render ----- ///
    const renderMetricsCard = (metrics: TMetrics | null) => {
        const liElems: JSX.Element[] = Object.entries(metrics || METRICS_FALLBACK).map(([key, value]) => (
            <li key={v4()}>
                <span className={'cardKey'}>{key}:</span>
                <span>{value || '--'}</span>
            </li>
        ));
        return <>{liElems}</>;
    };

    /// ----- componentDidMount ----- ///
    useEffect(() => {
        if (authContext?.isLoggedIn) fetchMetrics();
    }, [authContext?.isLoggedIn]);

    return (
        <>
            <div>
                <h1
                    className={s.projectsHeader}
                    role={'header'}
                >
                    Metrics
                </h1>
            </div>
            <section>
                <ul className={s.metricsCard}>{renderMetricsCard(metricsState)}</ul>
            </section>
        </>
    );
};
