import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from 'providers/Auth.provider';
import { ModalProvider } from 'providers/Modal.provider';
import { MetricsPage } from 'components/pages/Metrics';
import '@testing-library/jest-dom/extend-expect';
import { NewsPage } from 'components/pages/News';

describe('app', () => {
    it('should check news page header content ', function () {
        render(
            <ModalProvider>
                <AuthProvider>
                    <MetricsPage />
                </AuthProvider>
            </ModalProvider>
        );
        const header = screen.getByRole('header');
        expect(header).toHaveTextContent('Metrics');
    });
    it('should check metrics page header content ', function () {
        render(
            <ModalProvider>
                <AuthProvider>
                    <NewsPage />
                </AuthProvider>
            </ModalProvider>
        );
        const header = screen.getByRole('header');
        expect(header).toHaveTextContent('News');
    });
});
