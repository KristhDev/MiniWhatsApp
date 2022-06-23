import { useSelector } from 'react-redux';

import { RootState } from '../features/store';
import { AuthState } from '../interfaces/auth';

const useAuth = () => useSelector<RootState, AuthState>(state => state.auth);

export default useAuth;