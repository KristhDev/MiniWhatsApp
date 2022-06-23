import { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { useAppDispatch } from '../features/store';

import { resetError } from '../features/error';

import AuthRoute from './AuthRoute';
import PublicRoute from './PublicRoute';

import { useError } from '../hooks';

import { authRoutes, publicRoutes } from './routes';

import wassSwal from '../utils/swal';

const AppRouter = () => {
    const dispatch = useAppDispatch();

    const { msg } = useError();

    useEffect(() => {
        if (msg) {
            wassSwal.fire({
                title: 'Miniwass',
                text: msg,
                confirmButtonText: 'Esta bien'
            });

            dispatch(resetError());
        }
    }, [ msg, dispatch ]);

    return (
        <BrowserRouter>
            <Suspense fallback={ null }>
                <Routes>
                    {
                        publicRoutes.map(({ path, component: Component }) => (
                            <Route 
                                key={ path } 
                                path={ path } 
                                element={
                                    <PublicRoute>
                                        <Component />
                                    </PublicRoute>
                                } 
                            />
                        ))
                    }

                    {
                        authRoutes.map(({ path, component: Component }) => (
                            <Route 
                                key={ path } 
                                path={ path } 
                                element={
                                    <AuthRoute>
                                        <Component />
                                    </AuthRoute>
                                } 
                            />
                        ))
                    }

                    <Route 
                        path="*"
                        element={
                            <AuthRoute>
                                <Navigate to="/" />
                            </AuthRoute>
                        }
                    />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}

export default AppRouter;