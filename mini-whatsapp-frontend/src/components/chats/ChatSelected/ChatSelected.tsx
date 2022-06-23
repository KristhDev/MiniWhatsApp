import { useEffect } from 'react';
import { useEffectOnce, useUpdateEffect } from 'react-use';
import { Else, If, Then } from '@anissoft/react-conditions';

import { useAppDispatch } from '../../../features/store';

import { 
    addBlockedUsers, 
    loadMessages, 
    removeAllImagesToUpload, 
    removeUsersColors, 
    setChatFiles, 
    setStartLoadMoreMessages, 
    setUsersColors, 
    setUsersInChatSelected
} from '../../../features/chat';
import { hideSidebarMove } from '../../../features/ui';

import { useActions, useAuth, useChat, useSocket, useUi } from '../../../hooks';

import { Chat } from '../Chat';
import { ChatForm } from '../ChatForm'; 
import { ImagePreview } from '../../ui';
import { ProfileBar } from '../../auth';
import { MessagesForm } from '../MessagesForm';

import { 
    ContactUsersBlockedPayload,
    DeletedChatPayload, 
    GetChatPayload, 
    SendMoreMessagesPayload
} from '../../../interfaces/socket';

import { sideBarMove } from '../../../utils/constants';
import { handleGenerateColor } from '../../../utils/functions';
import { CancelIcon } from '../../../utils/icons';

import './chat-selected.scss';

export const ChatSelected = () => {
    const dispatch = useAppDispatch();
    const socket = useSocket();

    const { startSetMoreMessages, startRemoveChat, startLeaveOfGroup } = useActions();
    const { contacts, chats, user } = useAuth();
    const { chatSelected, imagesPreviews } = useChat();
    const { sideBarMoveType } = useUi();

    const { title: chatInfoTitle, component: SideBarMoveComponent } = sideBarMove[sideBarMoveType];

    const contactName = contacts.find(c => c.contact?._id === chatSelected.users[0].id)?.name;
    const chat = chats.find(c => c.id === chatSelected.id);

    const handleHideContactInfo = () => dispatch(hideSidebarMove());

    const handleGetUser = () => {
        if (chatSelected.isGroup) {
            return {
                id: chat?.id,
                name: chat?.name,
                image: chat?.image,
                lastConnection: new Date(),
                online: true,
                settings: undefined
            }
        }
        else {
            return {
                id: chatSelected.users[0].id || '',  
                name: contactName,
                image: chatSelected.users[0]?.image || '',
                lastConnection: chatSelected.users[0]?.lastConnection || new Date(),
                online: chatSelected.users[0].online,
                settings: chatSelected.users[0].settings
            }
        }
    }

    const handleShowSideBarMove = () => {
        return sideBarMoveType === 'contact-info' 
            || sideBarMoveType === 'message-info' 
            || sideBarMoveType === 'group-info'; 
    }

    useEffect(() => {
        socket.emit('miniwass-get-chat', { id: chatSelected.id }, (payload: GetChatPayload) => {
            dispatch(setUsersInChatSelected({ destinations: payload.usersPhones, users: payload.users }));

            if (payload.chat.isGroup) {
                const usersColors = payload.users.map(user => ({ 
                    userId: user.id || '', 
                    color: handleGenerateColor() 
                }));

                dispatch(setUsersColors({ usersColors }));
            }

            if (payload.chat.messages.length > 0) {
                dispatch(loadMessages({ messages: payload.chat.messages }));
                dispatch(setChatFiles({ files: payload?.files || [] }));
            }
            else dispatch(setStartLoadMoreMessages({ startLoadMoreMessages: false }));
        });

        socket.on('miniwass-contact-users-blocked', (payload: ContactUsersBlockedPayload) => {
            dispatch(addBlockedUsers({ blockedUsers: payload.blockedUsers, userId: payload.userId }));
        });
    }, [ chatSelected.id, dispatch, socket ]);

    useEffect(() => {
        if(chatSelected.usersColors.length > 1 && !chatSelected.isGroup) {
            dispatch(removeUsersColors());
        }
    }, [ chatSelected.usersColors, chatSelected.isGroup, dispatch ]);

    useUpdateEffect(() => {
        if (sideBarMoveType !== '') dispatch(hideSidebarMove());
        dispatch(removeAllImagesToUpload());
    }, [ chatSelected.id ]);

    useEffectOnce(() => {
        socket.on('miniwass-send-more-messages', (payload: SendMoreMessagesPayload) => {
            startSetMoreMessages(payload.status, payload.messages, payload.msg);
        });

        socket.on('miniwass-deleted-chat', (payload: DeletedChatPayload) => {
            startRemoveChat(payload.status, payload.chatId, payload.msg);
        });

        socket.on('miniwass-leave-of-group', () => {
            startLeaveOfGroup(user?.id || '', chat?.admins || []);
        });
    });

    return (
        <div className="chat-selected">
            <div 
                className={ 
                    (
                        (sideBarMoveType === 'contact-info') 
                        || (sideBarMoveType === 'message-info') 
                        || (sideBarMoveType === 'group-info')
                    )
                        ? 'chat-content chat-content-suprimed' 
                        : 'chat-content'
                }
            >
                <If condition={ imagesPreviews.length === 0 }>
                    <Then>
                        <ProfileBar 
                            user={ handleGetUser() } 
                            showUserInfo={ true } 
                            isGroup={ chatSelected.isGroup }
                        />

                        <Chat />

                        <ChatForm />

                        <MessagesForm />
                    </Then>

                    <Else>
                        <ImagePreview />
                    </Else>
                </If>
            </div>

            <div className="chat-info">
                <div className="chat-info__header">
                    <button onClick={ handleHideContactInfo }>
                        <CancelIcon />
                    </button>

                    <h3>{ chatInfoTitle }</h3>
                </div>

                <If condition={ handleShowSideBarMove() }>
                    <SideBarMoveComponent />
                </If>
            </div>
        </div>
    );
}