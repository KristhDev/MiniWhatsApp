import { useSelector } from 'react-redux';

import { RootState } from '../features/store';
import { ErrorState } from '../interfaces/error';

const useError = () => useSelector<RootState, ErrorState>(state => state.error);

export default useError;