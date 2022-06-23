import { lazy } from 'react';

export const authRoutes = [
    { path: '/', component: lazy(() => import('../pages/Home')) }
];

const LoginOrRegister = lazy(() => import('../pages/auth/LoginOrRegister'));

export const publicRoutes = [
    { path: '/login', component: LoginOrRegister },
    { path: '/register', component: LoginOrRegister }
];