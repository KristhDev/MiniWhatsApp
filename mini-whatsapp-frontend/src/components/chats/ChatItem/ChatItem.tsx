import { MouseEvent } from 'react';
import { Menu, Item, contextMenu } from 'react-contexify';
import { If } from '@anissoft/react-conditions';

import { useAppDispatch } from '../../../features/store';

import { toggleIsSelectedMessages } from '../../../features/chat';

import { useActions, useChat } from '../../../hooks';

import { handleFormatDate, handleGetUserImage } from '../../../utils/functions';
import { ArrowDownIcon, CameraIcon, GifIcon } from '../../../utils/icons';

import { ChatItemProps } from './interfaces';

import './chat-item.scss';

export const ChatItem = ({ contact, lastMessage, active, totalNotifications, isGroup, descriptionGroup, createdBy }: ChatItemProps) => {
    const dispatch = useAppDispatch();

    const { chatSelected: { id: chatSelectedId }, isSelectedMessages } = useChat();
    const { startDeleteChat, startGoToChat } = useActions();

    const handleSelectChat = () => {
        if (chatSelectedId !== contact?.chat) {
            if (isSelectedMessages) dispatch(toggleIsSelectedMessages());

            startGoToChat({
                id: contact?.chat || '', 
                name: (isGroup) ? (contact?.name || '') : '',
                destinations: [ contact?.contact?.phone || '' ], 
                users: [ { ...contact?.contact, id: contact?.contact?._id } || {} ],
                description: descriptionGroup,
                isGroup,
                createdBy
            });
        }
    };

    const handleToggleChatOptions = (e: MouseEvent) => {
        e.stopPropagation();

        contextMenu.show({
            id: `chat-item-options-${ contact?.chat }`,
            event: e
        });
    }

    const handleLastMessageFormat = () => {
        return (lastMessage?.content?.length > 43) 
            ? lastMessage?.content?.slice(0, 43) + '...' 
            : lastMessage?.content;
    }

    return (
        <div className={ (active) ? 'chat-item chat-item-active' : 'chat-item' } onClick={ handleSelectChat }>
            <div className="chat-item__img">
                <img 
                    src={ handleGetUserImage(contact?.contact?.image || '', isGroup) }
                    alt="img" 
                    loading="lazy"
                />
            </div>

            <div className="chat-item__content">
                <div className="user-info">
                    <span>{ contact.name }</span>
                    <small 
                        style={{ color: (totalNotifications > 0) ? '#00A884' : '#8696A0' }} 
                    >
                        { handleFormatDate(lastMessage.date) }
                    </small>
                </div>

                <div className="last-message">
                    <p>
                        { lastMessage.src?.image && <CameraIcon /> }
                        { lastMessage.src?.gif && <GifIcon /> }
                        { handleLastMessageFormat() }
                    </p>
                </div>

                <If condition={ totalNotifications > 0 }>
                    <small className="notifications">{ totalNotifications }</small>
                </If>

                <button 
                    onClick={ handleToggleChatOptions } 
                    onContextMenu={ handleToggleChatOptions } 
                    className="btn-options"
                >
                    <ArrowDownIcon />
                </button>
            </div>

            <Menu id={ `chat-item-options-${ contact?.chat }` }>
                <Item onClick={ () => startDeleteChat(contact.chat || '') }>Eliminar chat</Item>
            </Menu>
        </div>
    );
}
