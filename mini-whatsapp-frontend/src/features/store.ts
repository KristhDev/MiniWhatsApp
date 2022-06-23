import { configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'reduxjs-toolkit-persist';
import storage from 'reduxjs-toolkit-persist/lib/storage';
import { combineReducers } from 'redux';
import { useDispatch } from 'react-redux';

import { authReducer } from './auth';
import { chatReducer } from './chat';
import { errorReducer } from './error';
import { uiReducer } from './ui';
import { socketReducer } from './socket';

const reducers = combineReducers({
    auth: authReducer,
    chats: chatReducer,
    ui: uiReducer,
    socket: socketReducer,
    error: errorReducer
});

const persistConfig = {
    key: 'mini-wass-root',
    storage,
    blacklist: [ 'socket' ]
}

const reducer = persistReducer(persistConfig, reducers);

const store = configureStore({
    reducer,
    devTools: process.env.NODE_ENV !== 'production',
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false
    })
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof reducers>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();

export default store;