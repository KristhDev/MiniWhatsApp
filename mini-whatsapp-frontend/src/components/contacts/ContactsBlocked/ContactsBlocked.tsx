import { useState } from 'react';
import { useUpdateEffect } from 'react-use';
import { For } from 'react-loops';
import { If } from '@anissoft/react-conditions';

import { useAppDispatch } from '../../../features/store';

import { setBlockedUser } from '../../../features/auth';
import { setError } from '../../../features/error';

import { useAuth, useChat, usePrivacy, useSocket } from '../../../hooks';

import { ElementList, Modal } from '../../ui';

import { BlockedUserPayload } from '../../../interfaces/socket';

import { handleGetUserImage, handleGetUsername } from '../../../utils/functions';
import { AddUserIcon, CancelIcon, UserBlockIcon } from '../../../utils/icons';
import wassSwal from '../../../utils/swal';

import userDefault from '../../../assets/images/default-user.jpg';

import './contacts-blocked.scss';

export const ContactsBlocked = () => {
    const [ usersIds, setUsersIds ] = useState<string[]>([]);
    const [ isModalConfirmed, setIsModalConfirmed ] = useState(false);
    const dispatch = useAppDispatch();
    const socket = useSocket();

    const { user, contacts, privacyText } = useAuth();
    const { chatSelected: { destinations } } = useChat();
    const { showUserPrivacy } = usePrivacy();

    const miniContacts = contacts
        .filter(c => 
            !user?.blockedUsers?.includes(c.contact?._id || '') 
            || !c.contact?.blockedUsers?.includes(user?.id || '')
        )
        .map(c => ({
            id: c.contact?._id || '',
            name: c?.name || '',
            description: (showUserPrivacy(c.contact?.settings?.privacy?.info || 'all', c?.contact?._id || '')) 
                ? c.contact?.description 
                : '',
            image: (showUserPrivacy(c.contact?.settings?.privacy?.profilePhoto || 'all', c?.contact?._id || '')) 
                ? c.contact?.image || userDefault
                : userDefault
        }));

    const contactsBlocked = contacts.filter(c => user?.blockedUsers?.includes(c.contact?._id || ''));

    const ContactsModal = () => {
        return (
            <Modal 
                title="Añadir contacto bloqueado"
                onCloseModal={ handleCloseModal }
                children={
                    <ElementList 
                        disabledElements={ user.blockedUsers }
                        elements={ miniContacts }
                        multipleSelect
                        onChange={ setUsersIds }
                        onConfirm={ handleConfirmModal }
                    />
                }
            />
        );
    }

    const handleConfirmModal = () => wassSwal.clickConfirm();
    const handleCloseModal = () => wassSwal.clickCancel();

    const handleShowModalContacts = async () => {
        const { isConfirmed } = await wassSwal.fire({
            html: <ContactsModal />,
            showConfirmButton: true,
            allowOutsideClick: false,
            showCancelButton: true,
            customClass: {
                closeButton: 'btn-alert btn-alert-cancel',
                cancelButton: 'btn-alert btn-alert-cancel',
                denyButton: 'btn-alert btn-alert-confirm',
                confirmButton: 'btn-alert btn-alert-confirm',
                popup: 'wass-alert wass-swal-popup',
                title: 'wass-alert-text wass-alert-title',
                htmlContainer: 'wass-alert-text wass-swal-contatiner',
                actions: 'wass-alert-actions wass-swal-actions',
            }
        });

        (isConfirmed) ? setIsModalConfirmed(true) : setIsModalConfirmed(false);
    }

    const handleBlockUser = (payload: BlockedUserPayload) => {
        if (payload.status === 200) {
            dispatch(setBlockedUser({ blockedUsers: payload.blockedUsers }));
        }
        else dispatch(setError({ msg: payload.msg, status: payload.status }));
    }

    const handleDescriptionFormat = (description: string) => {
        return (description?.length > 40) 
            ? description?.slice(0, 40) + '...' 
            : description;
    }

    const handleBlockContact = () => {
        usersIds.forEach(id => {
            const blockedUserPayload = {
                userId: id, 
                destinations
            }

            socket.emit('miniwass-blocked-user', { ...blockedUserPayload }, (payload: BlockedUserPayload) => {
                handleBlockUser(payload);
            });
        });
    }

    const handleUnblockContact = async (userId: string, username: string) => {
        const { isConfirmed } = await wassSwal.fire({
            title: `¿Deseas desbloquear a ${ username }?`,
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonText: 'Desbloquear',
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
                actions: 'wass-alert-actions',
            }
        });

        if (isConfirmed) {
            const blockedUserPayload = {
                userId, 
                destinations
            }

            socket.emit('miniwass-unblocked-user', { ...blockedUserPayload }, (payload: BlockedUserPayload) => {
                handleBlockUser(payload);
            });
        }
    }

    useUpdateEffect(() => {
        if (isModalConfirmed) handleBlockContact();
    }, [ isModalConfirmed ]);

    return (
        <div className="contacts-blocked">
            <div 
                className="add-contact-blocked"
                onClick={ handleShowModalContacts }
            >
                <AddUserIcon />
                <p>Añadir contacto bloqueado</p>
            </div>

            <If condition={ !!(user?.blockedUsers && user?.blockedUsers?.length === 0) }>
                <div className="contacts-blocked__info">
                    <div className="info-image">
                        <UserBlockIcon />
                    </div>

                    <p>Aun no hay contactos bloqueados</p>
                </div>
            </If>

            <div className="contacts-blocked__list">
                <For 
                    of={ contactsBlocked }
                    children={ ({ contact }, { isLast }) => (
                        <div 
                            className="contact-blocked"
                            onClick={ 
                                () => handleUnblockContact(
                                    contact?._id || '', 
                                    handleGetUsername(contact?._id || '', [ { ...contact, id: contact?._id || '' } ], contacts) || ''
                                ) 
                            }
                        >
                            <div className="contact-blocked__image">
                                <img src={ handleGetUserImage(contact?.image || '', false) } alt="" />
                            </div>

                            <div className={ (isLast) ? 'contact-blocked__user-info no-border' : 'contact-blocked__user-info' }>
                                <div className="info">
                                    <p>{ handleGetUsername(contact?._id || '', [ { ...contact, id: contact?._id || '' } ], contacts) }</p>
                                    <small>{ handleDescriptionFormat(contact?.description || '') }</small>
                                </div>

                                <button 
                                    onClick={ 
                                        () => handleUnblockContact(
                                            contact?._id || '', 
                                            handleGetUsername(contact?._id || '', [ { ...contact, id: contact?._id || '' } ], contacts) || ''
                                        ) 
                                    }
                                >
                                    <CancelIcon />
                                </button>
                            </div>
                        </div>
                    ) }
                />
            </div>

            <p className="contacts-blocked__text">{ privacyText }</p>
        </div>
    );
}
