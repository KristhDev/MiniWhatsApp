import { Else, If, Then } from '@anissoft/react-conditions';
import { For } from 'react-loops';

import { useAppDispatch } from '../../../features/store';

import { setBlockedUser, startDeletingContact } from '../../../features/auth';
import { setError } from '../../../features/error';
import { setFiles, setFileViewType, showImageView, showSidebarMove } from '../../../features/ui';

import { useActions, useAuth, useChat, usePrivacy, useSocket } from '../../../hooks';

import { ContactButton } from '../ContactButton';
import { ChatFiles } from '../../chats';
import { ImageInfo } from '../../ui';
import { GroupParticipant } from '../../groups';

import { User } from '../../../interfaces/auth';
import { ChatResponse } from '../../../interfaces/http';
import { BlockedUserPayload } from '../../../interfaces/socket';

import userDefault from '../../../assets/images/default-user.jpg';

import './contact-info.scss';

export const ContactInfo = () => {
    const dispatch = useAppDispatch();
    const socket = useSocket();

    const { user: { blockedUsers, id: authId }, contacts, chats } = useAuth();
    const { chatSelected: { users, id: chatId, destinations } } = useChat();
    const { startDeleteChat, startGoToChat } = useActions();
    const { showUserPrivacy } = usePrivacy();

    const contact = contacts.find(c => c.contact?._id === users[0].id);

    const showContactInfo = showUserPrivacy(users[0]?.settings?.privacy?.info || 'all', users[0]?.id || ''); 
    const showCommonGroups = showUserPrivacy(users[0]?.settings?.privacy?.groups || 'all', users[0]?.id || '');

    const commonGroups = chats.filter(c => 
        c.isGroup && c?.users?.includes(authId || '') && c?.users?.includes(contact?.contact?._id || '')
    );

    const handleShowImageView = () => {
        dispatch(showImageView());
        dispatch(setFiles({
            files: [{
                _id: contact?.contact?._id || '',
                user: contact?.contact?._id || '',
                url: contact?.contact?.image || userDefault,
                createdAt: new Date()
            }]
        }));
        dispatch(setFileViewType({ fileViewType: 'contact' }));
    }

    const handleShowEditContact = () => {
        dispatch(showSidebarMove({ sidebarMoveType: 'edit-contact' }));
    }

    const handleDeleteContact = () => dispatch(startDeletingContact({ id: users[0]?.id || '' }));

    const handleBlockUser = (payload: BlockedUserPayload) => {
        if (payload.status === 200) {
            dispatch(setBlockedUser({ blockedUsers: payload.blockedUsers }));
        }
        else dispatch(setError({ msg: payload.msg, status: payload.status }));
    }

    const handleGetParticipant = (group: ChatResponse): User => {
        return {
            id: group.id,
            name: group.name,
            image: group.image,
            description: group.description
        }
    }

    const handleGoToChat = (group: ChatResponse) => {
        if (contact) {
            startGoToChat({
                id: group.id,
                name: group.name || '',
                destinations: [ contact?.contact?.phone || '' ],
                users: [ { ...contact?.contact, id: contact?.contact?._id || '' } || {} ],
                description: group.description || '',
                isGroup: group.isGroup,
                createdBy: group?.createdBy || '',
            });
        }
    }

    const blockedUserPayload = {
        userId: users[0].id || '', 
        destinations
    }

    const handleBlockContact = () => {
        socket.emit('miniwass-blocked-user', { ...blockedUserPayload }, (payload: BlockedUserPayload) => {
            handleBlockUser(payload);
        });
    }

    const handleUnblockContact = () => {
        socket.emit('miniwass-unblocked-user', { ...blockedUserPayload }, (payload: BlockedUserPayload) => {
            handleBlockUser(payload);
        });
    }

    return (
        <div className="contact-info">
            <div className="contact__content">
                <ImageInfo 
                    image={ (users[0]?.image) ? users[0]?.image : userDefault }
                    isGroup={ false }
                    onClick={ handleShowEditContact }
                    onShowPhoto={ handleShowImageView }
                    text={ users[0]?.phone || '' }
                    title={ contact?.name || '' }
                />

                <If condition={ showContactInfo }>
                    <div className="contact__info">
                        <small>Info.</small>

                        <If condition={ !!users[0]?.description }>
                            <p 
                                title={ users[0]?.description || '' }
                            >
                                { users[0]?.description || '' }
                            </p>
                        </If>
                    </div>
                </If>

                <ChatFiles />

                <If condition={ showCommonGroups }>
                    <div className="contact__groups">
                        <div className="title-groups">
                            <h3>{ commonGroups.length } grupos en común</h3>
                        </div>

                        <div className="groups">
                            <For
                                of={ commonGroups }
                                as={ (group, { key }) => (
                                    <GroupParticipant 
                                        admins={ group?.admins }
                                        authId={ authId || '' }
                                        isAdmin={ false }
                                        isGroup={ group.isGroup }
                                        key={ `${ group?.id || '' + key }` }
                                        onClick={ () => handleGoToChat(group) }
                                        participant={ handleGetParticipant(group) }
                                        showContextMenu={ false }
                                    />
                                ) }
                            />
                        </div>
                    </div>
                </If>

                <If condition={ !blockedUsers?.includes(users[0].id || '') }>
                    <Then>
                        <ContactButton text={ `Bloquear a ${ contact?.name }` } icon="block" action={ handleBlockContact } />
                    </Then>

                    <Else>
                        <ContactButton text={ `Desbloquear a ${ contact?.name }` } icon="block" action={ handleUnblockContact } />
                    </Else>
                </If>

                <ContactButton text="Eliminar Contacto" icon="blockuser" action={ handleDeleteContact  } />

                <ContactButton text="Eliminar Chat" icon="trash" action={ () => startDeleteChat(chatId) } />
            </div>
        </div>
    );
}