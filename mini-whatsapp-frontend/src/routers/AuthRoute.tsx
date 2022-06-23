import { Navigate } from 'react-router-dom';

import { useAuth } from '../hooks';

interface AuthRouteProps {
    children: JSX.Element
}

const AuthRoute = ({ children }: AuthRouteProps) => {
    const { user } = useAuth();

    return (user?.id) ? children : <Navigate to="/login" />;
}

export default AuthRoute;