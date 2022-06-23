import { useEffect } from 'react';
import { For } from 'react-loops';

import { useAppDispatch } from '../../../features/store';

import { addChat, addContact } from '../../../features/auth';

import { useAuth, useChat, useSocket } from '../../../hooks';

import { ChatItem } from '../ChatItem';

import { ChatsWithContact, Notification } from '../../../interfaces/chat';
import { SendNewContactPayload } from '../../../interfaces/socket';

import './chats-bar.scss';

interface ChatsBarProps {
    chats: ChatsWithContact[];
}

export const ChatsBar = ({ chats: chatsCompleted }: ChatsBarProps) => {
    const dispatch = useAppDispatch();
    const socket = useSocket();
    const { user: { id: authId } } = useAuth();
    const { chatSelected: { id: chatSelectedId } } = useChat();

    const handleGetNotifications = (notifications: Notification[]) => {
        return notifications?.filter(n => !n.readBy.includes(authId || '')).length || 0;
    }

    useEffect(() => {
        socket.on('miniwass-send-new-contact', (payload: SendNewContactPayload) => {
            dispatch(addContact({ contact: payload.contact }));
            dispatch(addChat({ chat: payload.chat }));
        });
    }, [ dispatch, socket ]);

    return (
        <div className="chats-bar">
            <For
                of={ chatsCompleted }
                as={ (chat, { key }) => (
                    <ChatItem
                        key={ chat?.id + key }
                        active={ chatSelectedId === chat?.id }
                        createdBy={ chat?.createdBy || '' }
                        contact={ chat.contact } 
                        descriptionGroup={ chat?.description || '' }
                        isGroup={ chat.isGroup }
                        lastMessage={{ 
                            content: chat?.messages[0]?.content || '',
                            date: chat?.messages[0]?.createdAt,
                            src: chat?.messages[0]?.src
                        }}
                        totalNotifications={ handleGetNotifications(chat?.notifications) }
                    />
                ) }
            />
        </div>
    );
}
