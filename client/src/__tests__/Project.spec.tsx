import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from 'providers/Auth.provider';
import { ModalProvider } from 'providers/Modal.provider';
import '@testing-library/jest-dom/extend-expect';
import { ProjectPage } from 'components/pages/Project';

describe('app', () => {
    it('should check projects page header content ', function () {
        render(
            <ModalProvider>
                <AuthProvider>
                    <ProjectPage />
                </AuthProvider>
            </ModalProvider>
        );
        const id = screen.getByRole('id');
        expect(id).toHaveTextContent('Project ID:');
    });
});
