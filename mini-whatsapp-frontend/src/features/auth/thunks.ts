import { createAsyncThunk, Dispatch } from '@reduxjs/toolkit';

import { miniWassApi } from '../../api';

import { addChat, addContact, removeSelectedContacts, updateContact, userLogin, userLogOut } from './slice';
import { chatUserLogOut, updateUserOfChatSelected } from '../chat';
import { resetError } from '../error';
import { hideSidebarMove, uiUserLogOut } from '../ui';

import { ContactResponse, LoginResponse, UserUpdateResponse } from '../../interfaces/http';

import { handleSetHttpError } from '../../utils/functions';

interface User {
    name: string;
    surname: string;
    username: string;
    phone: string;
    password: string;
}

export const startRegister = createAsyncThunk(
    'auth/startRegister',
    async (user: User, { dispatch }) => {
        try {
            const { data } = await miniWassApi<LoginResponse>({ 
                method: 'POST', endPoint: 'users/register', contentType: 'application/json', data: user 
            });

            localStorage.setItem('miniwass-token', data.token || '');

            dispatch(userLogin({ user: data.user, contacts: data.contacts, chats: data.chats }));
        } 
        catch (error) {
            handleSetHttpError(error, dispatch);
        }
    }
);

export const startLogin = createAsyncThunk(
    'auth/startLogin', 
    async (loginData: { phone: string, password: string }, { dispatch }) => {
        try {
            const { data } = await miniWassApi<LoginResponse>({ 
                method: 'POST', endPoint: 'users/login', contentType: 'application/json', data: loginData
            });

            localStorage.setItem('miniwass-token', data.token || '');

            const chats = data.chats.sort((a, b) => a.messages[0]?.createdAt > b.messages[0]?.createdAt ? -1 : 1);

            dispatch(userLogin({ user: data.user, contacts: data.contacts, chats }));
        } 
        catch (error) {
            handleSetHttpError(error, dispatch);
        }
    }
);

export const startRenewAuth = createAsyncThunk(
    'auth/startRenewAuth',
    async (_, { dispatch }) => {
        dispatch(removeSelectedContacts());
        dispatch(chatUserLogOut());
        dispatch(uiUserLogOut());

        try {
            const { data } = await miniWassApi<LoginResponse>({ 
                method: 'GET', endPoint: 'users/renew', contentType: 'application/json'
            });

            localStorage.setItem('miniwass-token', data.token || '');

            const chats = data.chats.sort((a, b) => a.messages[0]?.createdAt > b.messages[0]?.createdAt ? -1 : 1);

            dispatch(userLogin({ user: data.user, contacts: data.contacts, chats }));
        } 
        catch (error) {
            localStorage.removeItem('miniwass-token');
            dispatch(userLogOut());
            dispatch(resetError());

            handleSetHttpError(error, dispatch);
        }
    }
);

export const startLogOut = () => (dispatch: Dispatch) => {
    localStorage.removeItem('miniwass-token');
    dispatch(chatUserLogOut());
    dispatch(uiUserLogOut());
    dispatch(userLogOut());
}

export const startUpdatingUser = createAsyncThunk(
    'auth/startUpdatingUser',
    async ({ id, formData }: { id: string, formData: FormData }, { dispatch }) => {
        try {
            const { data } = await miniWassApi<UserUpdateResponse>({ 
                method: 'PUT', endPoint: `users/${ id }`, contentType: 'multipart/form-data', data: formData
            });

            return { user: data.user }
        } 
        catch (error) {
            handleSetHttpError(error, dispatch);
        }
    }
);

export const startAddContact = createAsyncThunk(
    'auth/startAddContact',
    async (contactData: { name: string, phone: string }, { dispatch }) => {
        try {
            const { data } = await miniWassApi<ContactResponse>({ 
                method: 'POST', endPoint: 'contacts', contentType: 'application/json', data: contactData
            });

            dispatch(addContact({ contact: data.contact }));
            dispatch(addChat({ chat: data.chat }));
            dispatch(hideSidebarMove());
        } 
        catch (error) {
            handleSetHttpError(error, dispatch);
        }
    }
);

export const startUpdatingContact = createAsyncThunk(
    'auth/startUpdatingContact',
    async ({ id, name, phone }: { id: string, name: string, phone: string }, { dispatch }) => {
        try {
            const { data } = await miniWassApi<ContactResponse>({ 
                method: 'PUT', endPoint: `contacts/${ id }`, contentType: 'application/json', data: { name, phone }
            });

            dispatch(updateUserOfChatSelected({ user: data.contact }));
            dispatch(updateContact({ contact: data.contact }));
            dispatch(hideSidebarMove());
        } 
        catch (error) {
            handleSetHttpError(error, dispatch);
        }
    }
);

export const startDeletingContact = createAsyncThunk(
    'auth/startDeletingContact',
    async ({ id }: { id: string }, { dispatch }) => {
        try {
            const { data } = await miniWassApi<ContactResponse>({ 
                method: 'DELETE', endPoint: `contacts/${ id }`, contentType: 'application/json'
            });

            dispatch(updateUserOfChatSelected({ user: data.contact }));
            dispatch(updateContact({ contact: data.contact }));
            dispatch(hideSidebarMove());
        } 
        catch (error) {
            handleSetHttpError(error, dispatch);
        }
    }
);