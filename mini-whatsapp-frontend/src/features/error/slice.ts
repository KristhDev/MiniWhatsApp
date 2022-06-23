import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ErrorState, SetErrorPayload } from '../../interfaces/error';

const INITIAL_STATE: ErrorState = {
    msg: '',
    status: 200
}

const errorSlice = createSlice({
    name: 'error',
    initialState: INITIAL_STATE,
    reducers: {
        setError: (state: ErrorState, action: PayloadAction<SetErrorPayload>) => {
            state.msg = action.payload.msg;
            state.status = action.payload.status;
        },

        resetError: () => {
            return { ...INITIAL_STATE }
        }
    }
});

export const { setError, resetError } = errorSlice.actions;

export default errorSlice.reducer;