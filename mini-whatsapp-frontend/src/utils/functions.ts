import { AxiosError } from 'axios';
import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';
import dayjs from 'dayjs';

import wassSwal from './swal';

import { setError } from '../features/error';

import { User, Contact } from '../interfaces/auth';
import { Message } from '../interfaces/chat';
import { ChatResponse } from '../interfaces/http';

import { urlRegExp } from './constants';

import groupDefault from '../assets/images/group-default.png';
import userDefault from '../assets/images/default-user.jpg';

export const handleShowErrors = <T extends Object>(errors: T) => {
    const values = Object.values(errors);

    wassSwal.fire({
        title: 'Mini WhatsApp',
        text: values[0],
        confirmButtonText: 'ESTA BIEN',
        allowOutsideClick: false
    });
}

export const handleNoRepeatMessages = (messages: Message[]): Message[] => {
    const messagesSet = new Set(messages.map(m => JSON.stringify(m)));

    return Array.from(messagesSet).map(m => JSON.parse(m));
}

export const handleAddDayToMessages = (messages: Message[]) => {
    let date = dayjs(messages[0]?.createdAt).format('DD/MM/YYYY');
    const messagesWithOutDay = handleRemoveDayFromMessages(messages);

    const msgs: Message[] = [];

    messagesWithOutDay.forEach((message, index) => {
        const dateMsg = dayjs(message.createdAt).format('DD/MM/YYYY');

        if (date !== dateMsg || index === 0) {
            msgs.push({
                ...message,
                content: dayjs(message.createdAt).format('DD/MM/YYYY'),
                user: 'not-user',
                _id: dayjs(message.createdAt).format('DD/MM/YYYY HH:mm:ss')
            });
            msgs.push(message);

            date = dateMsg;
        }
        else msgs.push(message);
    });

    return msgs;
}

export const handleRemoveDayFromMessages = (messages: Message[]) => {
    return messages.filter(m => m.user !== 'not-user');
}

export const handleFormatDate = (date?: Date) => {
    if (!date) return '';

    let dateFormated = dayjs(date).format('h:mm a');

    if (dayjs().diff(date, 'days') >= 1 && dayjs().diff(date, 'days') <= 6) {
        dateFormated = dayjs(date).format('dddd');
    }
    else if (dayjs().diff(date, 'days') > 6) {
        dateFormated = dayjs(date).format('DD/MM/YYYY');
    }

    return dateFormated;
}

export const handleFormatContent = (content?: string) => {
    if (!content) return '';

    let contentSplit = content.split(' ');

    contentSplit = contentSplit.map(cs => 
        (cs.match(urlRegExp)) ? `<a href="${ cs }" target="_blank" rel="noreferrer">${ cs }</a>` : cs
    );

    return contentSplit.join(' ');
}

export const handleGetUsername = (userId: string, users: User[], contacts: Contact[]) => {
    const user = users.find(u => u.id === userId);
    const userContact = contacts.find(c => c.contact?._id === user?.id);

    if (userContact) return userContact?.name;
    else return user?.phone;
}

export const handleGenerateColor = () => {
    return "#000000".replace(/0/g, () => (~~(Math.random() * 16)).toString(16));
}

export const handleGetUserImage = (image: string, isGroup: boolean) => {
    return (image) ? image : (isGroup) ? groupDefault : userDefault;
}

export const handleSetHttpError = (error: unknown, dispatch: ThunkDispatch<unknown, unknown, AnyAction>) => {
    const { response } = error as AxiosError<any>;

    const data = {
        msg: (response?.data as any)?.msg || '',
        status: (response?.data as any)?.status || 400,
    }

    dispatch(setError(data));
}

export const handleDownloadImage = async (image: string) => {
    const imageName = image.split('/')[ image?.split('/').length - 1 ];
    const blob = await fetch(image || '').then(resp => resp.blob());

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.style.display = 'none';
    a.href = url;
    a.download = imageName || '';

    document.body.appendChild(a);

    a.click();
    window.URL.revokeObjectURL(url);
}

export const handleGetMiniChats = (contacts: Contact[], chats: ChatResponse[], user: User) => {
    const miniContacts = contacts
        .filter(c => 
            !user?.blockedUsers?.includes(c.contact?._id || '') 
            || !c.contact?.blockedUsers?.includes(user?.id || '')
        )
        .map(c => ({
            id: c.chat || '',
            name: c?.name || '',
            description: c.contact?.description,
            image: c.contact?.image || userDefault,
            settings: c.contact?.settings 
        }));

    const miniGroups = chats
        .filter(c => c.isGroup)
        .map(c => ({
            id: c.id || '',
            name: c?.name || '',
            description: c.description,
            image: c?.image || groupDefault,
            settings: undefined
        }));

    return [ ...miniContacts, ...miniGroups ].sort((a, b) => a.name > b.name ? 1 : -1);
}