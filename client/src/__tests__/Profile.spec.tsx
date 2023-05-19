import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from 'providers/Auth.provider';
import { ModalProvider } from 'providers/Modal.provider';
import '@testing-library/jest-dom/extend-expect';
import { ProfilePage } from 'components/pages/Profile';

describe('app', () => {
    it('should check profile page content ', function () {
        render(
            <ModalProvider>
                <AuthProvider>
                    <ProfilePage />
                </AuthProvider>
            </ModalProvider>
        );
        const name = screen.getByRole('name');
        expect(name).toHaveTextContent('Name:');
        const group = screen.getByRole('group');
        expect(group).toHaveTextContent('Group:');
        const email = screen.getByRole('email');
        expect(email).toHaveTextContent('Email:');
        const username = screen.getByRole('username');
        expect(username).toHaveTextContent('Username:');
        const about = screen.getByRole('about');
        expect(about).toHaveTextContent('About:');
    });
});
