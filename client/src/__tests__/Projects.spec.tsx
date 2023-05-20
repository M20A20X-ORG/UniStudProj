import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from 'providers/Auth.provider';
import { ModalProvider } from 'providers/Modal.provider';
import '@testing-library/jest-dom/extend-expect';
import { ProjectsPage } from 'components/pages/Projects';

describe('app', () => {
    it('should check projects page header content ', function () {
        render(
            <ModalProvider>
                <AuthProvider>
                    <ProjectsPage />
                </AuthProvider>
            </ModalProvider>
        );
        const header = screen.getByRole('header');
        expect(header).toHaveTextContent('Projects');
    });
});
