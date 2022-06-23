import { Navigate } from 'react-router-dom';

import { useAuth } from '../hooks';

interface PublicRouteProps {
    children: JSX.Element
}

const PublicRoute = ({ children }: PublicRouteProps) => {
    const { user } = useAuth();

    return (user?.id) ? <Navigate to="/" /> : children;
}

export default PublicRoute;