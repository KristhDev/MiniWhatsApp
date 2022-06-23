import { useState } from 'react';
import { useMount, useUpdateEffect } from 'react-use';

import { ChatsBar } from '../../chats';
import { ProfileBar } from '../../auth';
import { Search } from '../Search';

import { useAuth, useDebounce, usePrivacy } from '../../../hooks';

import { Contact } from '../../../interfaces/auth';
import { ChatsWithContact } from '../../../interfaces/chat';
import { ChatResponse } from '../../../interfaces/http';

import userDefault from '../../../assets/images/default-user.jpg';

import './side-bar.scss';

export const Sidebar = () => {
    const { user, chats, contacts } = useAuth();
    const { showUserPrivacy } = usePrivacy();

    const [ searchValue, setSearchValue ] = useState('');
    const searchDebounceValue = useDebounce(searchValue, 500);
    const [ chatsWithContact, setChatsWithContact ] = useState<ChatsWithContact[]>([]);

    const  handleGetContact = (usersIds: string[], isGroup: boolean) => {
        if (isGroup) return null;

        const contactId = usersIds?.find(id => id !== user.id);
        const contact = contacts?.find(c => c.contact?._id === contactId);

        return {
            ...contact,
            contact: {
                ...contact?.contact,
                image: showUserPrivacy(contact?.contact?.settings?.privacy?.profilePhoto || 'all', contact?.contact?._id || '')
                    ? contact?.contact?.image || userDefault
                    : userDefault,
                description: showUserPrivacy(contact?.contact?.settings?.privacy?.info || 'all', contact?.contact?._id || '')
                    ? contact?.contact?.description
                    : ''
            }
        };
    }

    const handleGroupInfo = (chat: ChatResponse): Contact => {
        return {
            id: chat.id,
            chat: chat.id,
            name: chat.name,
            contact: {
                _id: chat.id,
                image: chat.image,
                phone: chat.name,
            }
        }
    }

    useUpdateEffect(() => {
        if (searchValue) {
            setChatsWithContact(
                chats.map(chat => ({
                    ...chat,
                    contact: handleGetContact(chat?.users, chat.isGroup) || handleGroupInfo(chat)
                }))
                .filter(chat => 
                    chat?.contact?.name?.toLowerCase().includes(searchDebounceValue.toLowerCase())
                    || chat?.name?.toLowerCase().includes(searchDebounceValue.toLowerCase()
                ))
                .filter(chat => chat?.contact?.name)
            );
        }
        else {
            setChatsWithContact(
                chats.map(chat => ({
                    ...chat,
                    contact: handleGetContact(chat?.users, chat.isGroup) || handleGroupInfo(chat)
                }))
                .filter(chat => chat?.contact?.name)
            );
        }
    }, [ searchDebounceValue, chats, contacts ]);

    useMount(() => {
        setChatsWithContact(
            chats.map(chat => ({
                ...chat,
                contact: handleGetContact(chat?.users, chat.isGroup) || handleGroupInfo(chat)
            }))
            .filter(chat => chat?.contact?.name)
        );
    });

    return (
        <div className="sidebar">
            <ProfileBar 
                user={ user }
                isGroup={ false } 
            />

            <Search 
                onChange={ setSearchValue }
                value={ searchValue }
            />

            <ChatsBar 
                chats={ chatsWithContact }
            />
        </div>
    );
}