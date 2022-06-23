import { MouseEvent, MutableRefObject, useEffect, useRef } from 'react';
import { useMeasure, useCss } from 'react-use';
import { contextMenu, Item, Menu } from 'react-contexify';
import { If } from '@anissoft/react-conditions';
import dayjs from 'dayjs';

import { useAppDispatch } from '../../../features/store';

import { startAddContact } from '../../../features/auth';
import { 
    addSelectedMessage, 
    removeSelectedMessage, 
    setMessageSelected, 
    setResponseMessage, 
    setIsRespMessage,
    toggleIsSelectedMessages,
    removeIsShowGifs
} from '../../../features/chat';
import { showSidebarMove, hideSidebarMove, showImageView, setFiles, setFileIndex, setFileViewType } from '../../../features/ui';

import { useActions, useAuth, useChat, useSocket } from '../../../hooks';

import { MessageResponse } from '../MessageResponse';

import { Message as MessageInterface } from '../../../interfaces/chat';

import { handleDownloadImage, handleFormatContent, handleGetUsername } from '../../../utils/functions';
import { ArrowDownIcon, ShareIcon } from '../../../utils/icons';
import wassSwal from '../../../utils/swal';

import { MessageProps } from './interfaces';

import './message.scss';

export const Message = ({ message, position, marginTop }: MessageProps) => {
    const dispatch = useAppDispatch();
    const socket = useSocket();
    const [ messageRef ] = useMeasure<HTMLDivElement>();

    const { user, contacts } = useAuth();
    const { isSelectedMessages, selectedMessages, chatSelected: { users, isGroup, usersColors, files } } = useChat();
    const { startDataDeleteMessages, startGoToChat } = useActions();

    const btnMsgOptionsRef = useRef() as MutableRefObject<HTMLButtonElement>;
    const coords = useRef(btnMsgOptionsRef?.current?.getBoundingClientRect());

    const authorMessage = users.find(u => u.id === message.user);
    const contact = contacts.find(c => c.contact?._id === message.user);
    const userColor = usersColors.find(uc => uc.userId === message.user)?.color;

    const authorClass = useCss({
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        padding: '0.6rem 0.6rem 0 0.6rem',
        paddingBottom: ((message.responseTo?._id || message.src?.image || message.src?.gif) && !message.isResending) ? '0.4rem' : 0,
        width: 'fit-content',
        p: {
            color: userColor,
            fontSize: '13.5px',

            '&:first-child': {
                marginRight: '0.5rem',
            }
        },
        '.username': {
            color: '#8696A0',
            fontSize: '13px'     
        },
        '&:hover': {
            p: {
                textDecoration: 'underline'
            },
            '.username': {
                textDecoration: 'underline'
            }
        }
    });

    useEffect(() => {
        btnMsgOptionsRef?.current.addEventListener('contextmenu', () => {
            coords.current = btnMsgOptionsRef?.current?.getBoundingClientRect();
        });

        btnMsgOptionsRef?.current.addEventListener('click', () => {
            coords.current = btnMsgOptionsRef?.current?.getBoundingClientRect();
        });
    }, [ ]);

    const handleToggleMessage = () => {
        (selectedMessages.includes(message._id)) 
            ? dispatch(removeSelectedMessage({ id: message._id }))
            : dispatch(addSelectedMessage({ id: message._id }));
    }

    const handleToggleMenuOptions = (e: MouseEvent) => {
        e.stopPropagation();

        contextMenu.show({
            id: `message-options-${ message._id }`,
            event: e, 
            position: {
                y: (coords.current?.top || 0) + 30,
                x: (message.user === user.id) ? (coords.current?.left || 0) - 180 : (coords.current?.left || 0) + 15
            }
        });
    }

    const handleGoToChat = () => {
        if (contact) {
            startGoToChat({
                id: contact?.chat || '',
                name: '',
                destinations: [ contact?.contact?.phone || '' ],
                users: [ { ...contact?.contact, id: contact?.contact?._id || '' } || {} ],
                isGroup: false,
                description: '',
                createdBy: '',
            });
        }
        else handleAddContact();
    }

    const handleAddContact = async () => {
        const { isConfirmed } = await wassSwal.fire({
            title: `¿Quieres agregar a ${ authorMessage?.username } como contacto?`,
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonText: 'Agregar',
            cancelButtonText: 'Cancelar',
            allowOutsideClick: false,
            customClass: {
                closeButton: 'btn-alert btn-alert-cancel',
                cancelButton: 'btn-alert btn-alert-cancel',
                confirmButton: 'btn-alert btn-alert-confirm',
                popup: 'wass-alert',
                title: 'wass-alert-text wass-alert-title',
                htmlContainer: 'wass-alert-text',
                actions: 'wass-alert-actions',
            }
        });

        if (isConfirmed) {
            dispatch(startAddContact({
                name: authorMessage?.username || '',
                phone: authorMessage?.phone || ''
            }));
        }
    }

    const handleImageView = () => {
        dispatch(showImageView());
        dispatch(setFiles({ files }));

        const index = files.findIndex(f => f._id === message._id);
        dispatch(setFileIndex({ fileIndex: index }));
        dispatch(setFileViewType({ fileViewType: 'message' }));
    }

    const handleRespMessage = () => {
        dispatch(setIsRespMessage());
        dispatch(setResponseMessage({ respMsgId: message._id }));
        dispatch(removeIsShowGifs());
    }

    const handleResendMessages = () => { 
        dispatch(toggleIsSelectedMessages());
        dispatch(addSelectedMessage({ id: message._id }));
    }

    const handleDeleteMessage = async () => {
        const { isConfirmed, isDenied } = await wassSwal.fire({
            title: '¿Quieres eliminar este mensaje?',
            showCancelButton: true,
            showDenyButton: true,
            showConfirmButton: (message.user === user.id),
            confirmButtonText: 'Eliminar para todos',
            denyButtonText: 'Eliminar para mi',
            cancelButtonText: 'Cancelar',
            allowOutsideClick: false,
            customClass: {
                closeButton: 'btn-alert btn-alert-cancel',
                cancelButton: 'btn-alert btn-alert-cancel',
                denyButton: 'btn-alert btn-alert-confirm',
                confirmButton: 'btn-alert btn-alert-confirm',
                popup: 'wass-alert',
                title: 'wass-alert-text wass-alert-title',
                htmlContainer: 'wass-alert-text',
                actions: (message.user === user.id) ? 'wass-alert-actions wass-alert-actions-col' : 'wass-alert-actions',
            }
        });

        const data = startDataDeleteMessages(isDenied, isConfirmed, [ message._id ]);

        if (isConfirmed || isDenied) {
            dispatch(addSelectedMessage({ id: message._id }));
            socket.emit('miniwass-delete-messages', data);
        }
    }

    const handleShowMessageInfo = (message: MessageInterface) => {
        dispatch(hideSidebarMove());

        setTimeout(() => {
            dispatch(showSidebarMove({ sidebarMoveType: 'message-info' }));
            dispatch(setMessageSelected({ message }));
        }, 300);
    }

    const handleMessageContainerClass = () => {
        return `message-container message__${ position }`
            + ` ${ (marginTop) ? 'message__space' : '' }`
            + ` ${ (marginTop) ? `message__${ position }-first` : '' }`
            + ` ${ (isSelectedMessages) ? 'hover-message-container' : '' }`
            + ` ${ (selectedMessages.includes(message._id)) ? 'message-selected' : '' }`
    }

    return (
        <div
            id={ `message-container-${ message._id }` }
            className={ handleMessageContainerClass() }
            ref={ messageRef }
        >
            <div 
                className={ 
                    (isSelectedMessages) 
                        ? 'message-checkbox show-message-checkbox' 
                        : 'message-checkbox' 
                }
            >
                <input 
                    type="checkbox" 
                    id={`${ message._id }-checkbox`} 
                    checked={ selectedMessages.includes(message._id) } 
                    onChange={ handleToggleMessage }
                />

                <label htmlFor={`${ message._id }-checkbox`}></label>
            </div>

            <div 
                className={ (isSelectedMessages) ? 'message message-margin' : 'message' }
                style={ (message.src?.image) ? { width: 306 } : undefined }
            >
                <If condition={ isGroup && user.id !== message.user && !!authorMessage?.username && marginTop }>
                    <div className={ authorClass }>
                        <p onClick={ handleGoToChat }>{ handleGetUsername(message.user, users, contacts) || '' }</p>

                        <If condition={ !contact || contact.name === contact.contact?.phone }>
                            <p className="username">~{ authorMessage?.username }</p>
                        </If>
                    </div>
                </If>

                <If condition={ message.isResending && message.user !== user.id }>
                    <div className="resend">
                        <ShareIcon />
                        <small>Reenviado</small>
                    </div>
                </If>

                <If condition={ !!message.responseTo?._id }>
                    <MessageResponse 
                        content={ message.responseTo?.content || '' } 
                        image={ message.responseTo?.src?.image || message.responseTo?.src?.gif }
                        imageSize={ 65 }
                        userId={ message.responseTo?.user || '' } 
                        userName={ handleGetUsername(message.responseTo?.user || '', users, contacts) || '' }
                    />
                </If>

                <If condition={ !!message?.src?.image || !!message.src?.gif }>
                    <div 
                        className="image"
                        style={{ cursor: (message.src?.image || message.src?.gif) ? 'pointer' : 'initial' }}
                        onClick={ handleImageView }
                    >
                        <img 
                            src={ message.src?.image || message.src?.gif } 
                            alt=""
                            loading="lazy"
                        />
                    </div>
                </If>

                <div 
                    className={ ((message.src?.image || message.src?.gif) && !message.content) ? 'content content-image' : 'content'}
                >
                    <p dangerouslySetInnerHTML={{ __html: handleFormatContent(message.content) }} />
                    <small>{ dayjs(message.createdAt).format('h:mm a') }</small>
                </div>

                <If condition={ !isSelectedMessages }>
                    <button
                        key={ `btn-msg-options-${ message._id }` }
                        onContextMenu={ handleToggleMenuOptions } 
                        onClick={ handleToggleMenuOptions } 
                        className="btn-options"
                        style={{ 
                            backgroundColor: (message.responseTo?._id || message.src?.image || message.src?.gif) 
                                ? 'transparent' : 'inherit' 
                        }}
                        ref={ btnMsgOptionsRef }
                    >
                        <ArrowDownIcon 
                            style={{ 
                                fill: (!!message.responseTo?._id || !!message.src?.image || !!message.src?.gif) 
                                    ? '#DEE1E3' : 'rgba(134, 150, 160, 0.7)' 
                            }} 
                        />
                    </button>
                </If>
            </div>

            <Menu 
                id={ `message-options-${ message._id }` } 
                className={ 
                    (message.user === user.id) 
                        ? 'react-contexify__scale-right-message' 
                        : 'react-contexify__scale-left-message' 
                }
            >
                <If condition={ message.user === user.id }>
                    <Item onClick={ () => handleShowMessageInfo(message) }>Info. del mensaje</Item>
                </If>

                <Item onClick={ handleRespMessage }>Responder</Item>

                <If condition={ !!message.src?.image || !!message.src?.gif }>
                    <Item onClick={ () => handleDownloadImage(message.src?.image || message.src?.gif || '') }>Descargar</Item>
                </If>

                <Item onClick={ handleResendMessages }>Reenviar mensaje</Item>
                <Item onClick={ handleDeleteMessage }>Eliminar mensaje</Item>
            </Menu>
        </div>
    );
}