import { MutableRefObject, useEffect, useRef, useState } from 'react';
import { useMount, useUpdateEffect } from 'react-use';
import { If } from '@anissoft/react-conditions';
import { For } from 'react-loops';
import { TailSpin } from 'react-loader-spinner';
import InfiniteScroll from 'react-infinite-scroll-component';

import { useActions, useAuth, useChat, useSocket } from '../../../hooks';

import { ChatDate } from '../ChatDate';
import { Message } from '../Message';

import { ArrowDownIcon } from '../../../utils/icons';

import './chat.scss';

export const Chat = () => {
    const socket = useSocket();

    const { startRemoveChatNotifications } = useActions();

    const [ scrollTop, setScrollTop ] = useState<number>(0);
    const [ scrollHeight, setScrollHeight ] = useState<number>(10);
    const [ page, setPage ] = useState<number>(2);

    const chatRef = useRef() as MutableRefObject<HTMLDivElement>;
    const chatEndRef = useRef() as MutableRefObject<HTMLDivElement>;

    const { user: { id: authId, settings } } = useAuth();
    const { messages, chatSelected, startLoadMoreMessages } = useChat();

    const chatHeight = chatSelected.height + 101;

    const handleMarginTop = (msgUserId: string, index: number) => {
        if (index === 0) return true;

        const prevMsgUserId = messages[index - 1]?.user;
        if (prevMsgUserId === msgUserId) return false;

        return true;
    }

    const handleScroll = (top: number) => {
        chatRef?.current?.scrollTo({
            top,
            behavior: 'smooth'
        });
    }

    const scrollCondition = () => (((scrollHeight * 0.08) * -1) < scrollTop);

    const handleGetMoreMessages = () => {
        if (startLoadMoreMessages) {
            socket.emit('miniwass-get-more-messages', { chatId: chatSelected.id, page });
            setPage(page + 1);     
        }
    }

    useEffect(() => {
        chatRef.current.scrollTop = chatRef?.current?.scrollHeight;
    }, [ ]);

    useEffect(() => {
        chatRef?.current?.addEventListener('scroll', () => {
            setScrollHeight(chatRef?.current?.scrollHeight);
            setScrollTop(chatRef?.current?.scrollTop);
        });
    }, [ chatRef?.current?.scrollTop ]);

    useMount(() => {
        startRemoveChatNotifications();
    });

    useUpdateEffect(() => {
        startRemoveChatNotifications();
        setPage(2);
    }, [ chatSelected.id ]);

    return (
        <div 
            className="chat" 
            style={{ 
                backgroundImage: `url(${ settings?.background.backgroundSelected })`,
                height: `calc(100vh - ${ chatHeight }px)` 
            }}
        >
            <div className={ (!scrollCondition()) ? 'btn-down' : 'btn-down btn-down-hide' }>
                <button onClick={ () => handleScroll(chatRef?.current?.scrollHeight) }>
                    <ArrowDownIcon />
                </button>
            </div>

            <If condition={ messages.length < 1 && startLoadMoreMessages }>
                <div className="chat__loader">
                    <div className="loader">
                        <TailSpin color="#00A884" height={ 25 } width={ 25 } />
                    </div>
                </div>
            </If>

            <div id="scrollableChat" ref={ chatRef } className="chat__messages">
                <InfiniteScroll
                    dataLength={ messages.length }
                    next={ handleGetMoreMessages }
                    loader={ null }
                    inverse={ true }
                    hasMore={ true }
                    scrollableTarget="scrollableChat"
                >
                    <br />

                    <For 
                        of={ messages }
                        as={ (message, { index }) => (message.user === 'not-user') 
                            ? ( <ChatDate key={ message?.content } date={ message.content } /> ) 
                            : (
                                <Message
                                    key={ message?._id } 
                                    position={ (message.user === authId) ? 'right' : 'left' }
                                    marginTop={ handleMarginTop(message.user, index) }
                                    message={ message }
                                />
                            )
                        }
                    />

                    <br />

                    <div ref={ chatEndRef } />
                </InfiniteScroll>
            </div>
        </div>
    );
}