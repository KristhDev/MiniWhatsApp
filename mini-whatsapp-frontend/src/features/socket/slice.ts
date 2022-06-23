import { createSlice } from '@reduxjs/toolkit';
import { io } from 'socket.io-client';

import { SocketState } from '../../interfaces/socket';

const socket = io(process.env.REACT_APP_API_URL || '', {
    withCredentials: true,
    autoConnect: false,
    auth: {
        'x-token': localStorage.getItem('miniwass-token') || ''
    }
});

const INITIAL_STATE: SocketState = {
    socket
}

const socketSlice = createSlice({
    name: 'socket',
    initialState: INITIAL_STATE,
    reducers: {}
});

export default socketSlice.reducer;