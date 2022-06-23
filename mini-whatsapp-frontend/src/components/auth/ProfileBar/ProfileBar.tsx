import { MouseEvent, MutableRefObject, useEffect, useRef } from 'react';
import { useMeasure } from 'react-use';
import { Case, Else, If, Switch, Then } from '@anissoft/react-conditions';
import { contextMenu, Item, Menu } from 'react-contexify';
import { TailSpin } from 'react-loader-spinner';
import dayjs from 'dayjs';

import { useAppDispatch } from '../../../features/store';

import { startLogOut, setChat, toggleIsAuthLoading } from '../../../features/auth';
import { deleteAllMessages, removeChatFiles, toggleIsSelectedMessages } from '../../../features/chat';
import { setError } from '../../../features/error';
import { hideLoaderPopup, showLoaderPopup, showSidebarMove } from '../../../features/ui';

import { useActions, useAuth, useChat, usePrivacy, useSocket } from '../../../hooks';

import { CleanChatForMePayload } from '../../../interfaces/socket';
import { SideBarMoveType } from '../../../interfaces/ui';

import { handleFormatDate, handleGetUserImage } from '../../../utils/functions';
import { ThreePointsIcon } from '../../../utils/icons';
import wassSwal from '../../../utils/swal';

import userDefault from '../../../assets/images/default-user.jpg';

import { ProfileBarProps } from './interfaces';

import './profile-bar.scss';

export const ProfileBar = ({ showUserInfo = false, user, isGroup }: ProfileBarProps) => {
    const dispatch = useAppDispatch();
    const socket = useSocket();
    const [ profileBarRef ] = useMeasure<HTMLDivElement>();

    const { user: { id: authId }, contacts, chats } = useAuth();
    const { chatSelected: { id: chatId, users, name: chatName, files: chatFiles } } = useChat();

    const { startLeaveOfGroup, startDeleteChat } = useActions();
    const { showUserPrivacy, showLastConnection } = usePrivacy();

    const showImageProfileBar = (isGroup) 
        ? true
        : showUserPrivacy(user?.settings?.privacy?.profilePhoto || 'all', user?.id || '');

    const showLastConn = showLastConnection(user?.settings?.privacy?.lastConnection || 'all', user?.id || '');

    const chatAdmins = chats.find(c => c.id === chatId)?.admins || [];
    const chatRemovedFor = chats.find(c => c.id === chatId)?.removedFor || [];

    const btnProfileBarOptionsRef = useRef() as MutableRefObject<HTMLButtonElement>;
    const coords = useRef(btnProfileBarOptionsRef.current?.getBoundingClientRect());

    const handleShowSidebarMove = (type: SideBarMoveType) => dispatch(showSidebarMove({ sidebarMoveType: type }));

    const handleSelectedMessages = () => dispatch(toggleIsSelectedMessages());

    const handleToggleMenuOptions = (e: MouseEvent) => {
        contextMenu.show({
            id: `profile-bar-options-${ user.id }`,
            event: e,
            position: {
                x: (coords.current?.left || 0) - 155,
                y: (coords.current?.bottom || 0) + 5
            }
        });
    }

    const handleDateFormat = () => {
        let date = handleFormatDate(user?.lastConnection || new Date());

        if (dayjs().diff(user?.lastConnection, 'days') > 0) {
            date = date + ' a la(s) ' + dayjs(user?.lastConnection).format('h:mm a');
        }
        else date = 'hoy a la(s) ' + date;

        return date;
    }

    const handleGetMembers = () => {
        const chatUsers = users.filter(u => !chatRemovedFor.includes(u?.id || ''));

        const membersContacts = contacts.map(c => 
            chatUsers.find(u => u.id === c.contact?._id) ? c.name : ''
        )
        .filter(Boolean).sort();

        const membersUsers = chatUsers.map(u => 
            contacts.find(c => c.contact?._id === u.id) ? '' : u.phone
        )
        .filter(Boolean).sort();

        const members = [ ...membersContacts, ...membersUsers, 'Tú' ].join(', ');

        if (members === `${ chatName }, Tú`) return 'haz click aquí para la info del grupo';
        if (members.length > 120) return members.slice(0, 120) + '...';

        return members;
    }

    const handleShowInfo = () => {
        if (user.id === authId) return handleShowSidebarMove('profile');
        else if (user.id !== authId && !isGroup) return handleShowSidebarMove('contact-info');
        else if (user.id !== authId && isGroup) return handleShowSidebarMove('group-info');
    }

    const handleRemovedMessages = async () => {
        const { isConfirmed } = await wassSwal.fire({
            title: '¿Borrar los mensajes de esta chat?',
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Vaciar',
            allowOutsideClick: false
        });

        if (isConfirmed) {
            dispatch(showLoaderPopup({ msg: 'Vaciando chat' }));

            socket.emit('miniwass-clean-chat-for-me', { chatId, }, (payload: CleanChatForMePayload) => {
                if (payload.resp.status === 200) { 
                    dispatch(deleteAllMessages());
                    dispatch(setChat({ chat: payload.resp.chat }));

                    if (chatFiles.length > 0) dispatch(removeChatFiles());
                }
                else dispatch(setError({ msg: payload?.resp.msg || '', status: payload?.resp.status || 400 }));

                dispatch(hideLoaderPopup());
            });
        }
    }

    const handleLogOut = () => {
        dispatch(toggleIsAuthLoading());

        setTimeout(() => {
            dispatch(startLogOut());
        }, 500);
    }

    useEffect(() => {
        btnProfileBarOptionsRef?.current.addEventListener('contextmenu', () => {
            coords.current = btnProfileBarOptionsRef?.current?.getBoundingClientRect();
        });

        btnProfileBarOptionsRef?.current.addEventListener('click', () => {
            coords.current = btnProfileBarOptionsRef?.current?.getBoundingClientRect();
        });
    }, [ ]);

    return (
        <div id={ `profile-bar-${ user.id }` } ref={ profileBarRef } className="profile-bar">
            <div className="profile-bar__info">
                <div 
                    className="user-img" 
                    onClick={ handleShowInfo }
                >
                    <img 
                        src={ 
                            (showImageProfileBar) 
                                ? handleGetUserImage(user?.image || '', isGroup) 
                                : userDefault 
                        } 
                        alt="user"
                        loading="lazy"
                    />
                </div>

                <If condition={ showUserInfo }>
                    <If condition={ !user?.name }>
                        <Then>
                            <div className="user-loader">
                                <TailSpin 
                                    color="#DEE1E3" 
                                    height={ 38 }
                                    width={ 38 } 
                                />
                            </div>
                        </Then>

                        <Else>
                            <div className="user-info">
                                <span onClick={ handleShowInfo }>{ user?.name }</span>

                                <If condition={ !isGroup }>
                                    <Then>
                                        <p>
                                            { 
                                                (showLastConn) 
                                                    ? (user?.online) 
                                                        ? 'en línea' 
                                                        : `últ. vez ${ handleDateFormat() }` 
                                                    : ''
                                            }
                                        </p> 
                                    </Then>

                                    <Else>
                                        <p>{ handleGetMembers() }</p>
                                    </Else>
                                </If>
                            </div>
                        </Else>
                    </If>
                </If>
            </div>

            <div className="profile-bar__options">
                <button 
                    ref={ btnProfileBarOptionsRef }
                    onClick={ handleToggleMenuOptions }
                    onContextMenu={ handleToggleMenuOptions }
                    title="Menú"
                >
                    <ThreePointsIcon />
                </button>

                <Menu id={ `profile-bar-options-${ user.id }` } className="react-contexify__scale-right-profile-bar">
                    <Switch>
                        <Case condition={ user.id === authId }>
                            <Item onClick={ () => handleShowSidebarMove('new-contact') }>Nuevo contacto</Item>
                            <Item onClick={ () => handleShowSidebarMove('new-group-participants') }>Nuevo grupo</Item>
                            <Item onClick={ () => handleShowSidebarMove('user-settings') }>Configuración</Item>
                            <Item onClick={ handleLogOut }>Cerrar sesión</Item>
                        </Case>

                        <Case condition={ user.id !== authId && !isGroup }>
                            <Item onClick={ () => handleShowSidebarMove('contact-info') }>Info. del contacto</Item>
                            <Item onClick={ handleSelectedMessages }>Seleccionar mensajes</Item>
                            <Item onClick={ handleRemovedMessages }>Vaciar mensajes</Item>
                            <Item onClick={ () => startDeleteChat(chatId) }>Eliminar chat</Item>
                        </Case>

                        <Case condition={ isGroup }>
                            <Item onClick={ () => handleShowSidebarMove('group-info') }>Info. del grupo</Item>
                            <Item onClick={ handleSelectedMessages }>Seleccionar mensajes</Item>
                            <Item onClick={ handleRemovedMessages }>Vaciar mensajes</Item>
                            <Item onClick={ () => startLeaveOfGroup(authId || '', chatAdmins) }>Salir del grupo</Item>
                        </Case>
                    </Switch>
                </Menu>
            </div>
        </div>
    );
}