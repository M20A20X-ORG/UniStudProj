import React from 'react';

import { AuthProvider } from 'components/providers/Auth.provider';
import { RouterProvider } from 'components/providers/Router.provider';

import 'styles/global.scss';

const App = () => (
    <AuthProvider>
        <RouterProvider />
    </AuthProvider>
);

export default App;
