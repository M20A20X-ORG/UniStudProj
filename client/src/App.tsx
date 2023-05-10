import React from 'react';

import { ModalProvider } from 'providers/Modal.provider';
import { AuthProvider } from 'providers/Auth.provider';
import { RouterProvider } from 'providers/Router.provider';

import 'styles/global.scss';

const App = () => (
    <ModalProvider>
        <AuthProvider>
            <RouterProvider />
        </AuthProvider>
    </ModalProvider>
);

export default App;
