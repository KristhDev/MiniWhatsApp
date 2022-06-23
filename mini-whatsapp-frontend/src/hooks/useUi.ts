import { useSelector } from 'react-redux';

import { RootState } from '../features/store';
import { UiState } from '../interfaces/ui';

const useUi = () => useSelector<RootState, UiState>(state => state.ui);

export default useUi;