import { useEffect, useState } from 'react';
import { useUpdateEffect } from 'react-use';
import { useFilePicker } from 'use-file-picker';
import { If } from '@anissoft/react-conditions';
import { For } from 'react-loops';

import store, { useAppDispatch } from '../../../features/store';

import { setSelectedUsers, removeAllSelectedUsers } from '../../../features/chat';
import { setFiles, setFileViewType, showImageView, showLoaderPopup } from '../../../features/ui';

import { useActions, useAuth, useChat, usePrivacy, useSocket } from '../../../hooks';

import { AddDescription } from '../AddDescription';
import { ContactButton } from '../../contacts';
import { ChatFiles } from '../../chats';
import { ElementList, ImageInfo, Modal } from '../../ui';
import { GroupParticipant } from '../GroupParticipant';

import { handleGetUsername } from '../../../utils/functions';
import wassSwal from '../../../utils/swal';

import userDefault from '../../../assets/images/default-user.jpg';
import groupDefault from '../../../assets/images/group-default.png';

import './group-info.scss';

export const GroupInfo = () => {
    const dispatch = useAppDispatch();
    const socket = useSocket();

    const { chats, contacts, user } = useAuth();
    const { chatSelected: { name: chatName, users, id, description, createdBy } } = useChat();
    const { startLeaveOfGroup, startGoToChat } = useActions();
    const { showUserPrivacy } = usePrivacy();

    const [ newCreatorId, setNewCreatorId ] = useState<string[]>([]);
    const [ usersIds, setUsersIds ] = useState<string[]>([]);
    const [ isConfirmedNewCreator, setIsConfirmedNewCreator ] = useState<boolean>(false);

    const chat = chats.find(c => c.id === id);
    const usersFiltered = users
        .filter(u => !chat?.removedFor.includes(u.id || ''))
        .map(u => ({
            ...u,
            description: (showUserPrivacy(u.settings?.privacy?.info || 'all', u?.id || '')) 
            ? u.description 
            : '',
            image: (showUserPrivacy(u.settings?.privacy?.profilePhoto || 'all', u?.id || '')) 
                ? u.image || userDefault
                : userDefault
        }));

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

    const miniParticipants = usersFiltered.map(u => ({
        id: u.id || '',
        name: handleGetUsername(u?.id || '', usersFiltered, contacts) || '',
        description: u?.description,
        image: u?.image
    }))

    const participants = [ user, ...usersFiltered ];

    const handleConfirmModal = () => wassSwal.clickConfirm();
    const handleCloseModal = () => wassSwal.clickCancel();

    const [ openFileSelector, { plainFiles } ] = useFilePicker({
        accept: 'image/*',
        multiple: false
    });

    const PaticipantsModal = () => {
        return (
            <Modal 
                onCloseModal={ handleCloseModal }
                title="Añadir participante" 
                children={
                    <ElementList
                        disabledElements={ usersFiltered.map(u => u.id || '') }
                        elements={ miniContacts }
                        multipleSelect
                        onChange={ setUsersIds }
                        onConfirm={ handleConfirmModal }
                    />
                } 
            />
        );
    }

    const CreatorModal = () => {
        return (
            <Modal
                onCloseModal={ handleCloseModal }
                title="Designar como creador del grupo"
                children={
                    <ElementList 
                        elements={ miniParticipants }
                        multipleSelect={ false }
                        onChange={ setNewCreatorId }
                        onConfirm={ handleConfirmModal }
                    />
                }
            />
        );
    }

    const handleAddParticipant = async () => {
        const { isConfirmed } = await wassSwal.fire({
            html: <PaticipantsModal />,
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

        if (isConfirmed) {
            socket.emit('miniwass-add-participant-to-group', { 
                groupId: id, 
                usersIds: store.getState().chats.selectedUsers
            });
        }

        dispatch(removeAllSelectedUsers());
    }

    const handleGoToChat = (userId: string) => {
        if (user.id === userId) return;

        const contact = contacts.find(c => c.contact?._id === userId);

        if (contact) {
            startGoToChat({
                id: contact?.chat || '',
                name: '',
                destinations: [ contact?.contact?.phone || '' ],
                users: [ { ...contact?.contact, id: contact?.contact?._id || '' } || {} ],
                description: '',
                isGroup: false,
                createdBy: '',
            });
        }
    }

    const handleShowImageView = () => {
        dispatch(showImageView());
        dispatch(setFiles({ 
            files: [{
                _id: chat?.id || '',
                user: chat?.createdBy || '',
                url: chat?.image || groupDefault,
                createdAt: chat?.createdAt || new Date()
            }]
        }));
        dispatch(setFileViewType({ fileViewType: 'group' }));
    }

    const handleRemovePhoto = async () => {
        const { isConfirmed } = await wassSwal.fire({
            title: '¿Deseas eliminar el ícono de este grupo?',
            showCancelButton: true,
            cancelButtonText: 'CANCELAR',
            confirmButtonText: 'ELIMINAR',
            allowOutsideClick: false
        });

        if (isConfirmed) {
            socket.emit('miniwass-remove-group-photo', { groupId: id });
        }
    }

    const handleLeaveOfGroup = async () => {
        if (createdBy === user.id) {
            const { isConfirmed } = await wassSwal.fire({
                html: <CreatorModal />,
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

            if (isConfirmed) setIsConfirmedNewCreator(true);
        }
        else startLeaveOfGroup(user?.id || '', chat?.admins || []);
    }

    useUpdateEffect(() => {
        if (isConfirmedNewCreator) {
            socket.emit('miniwass-assign-creator-to-group', { 
                groupId: id, 
                newCreatorId: newCreatorId[0]
            });

            setIsConfirmedNewCreator(false);
        }
    }, [ isConfirmedNewCreator ]);

    useEffect(() => {
        if (plainFiles.length > 0) {
            dispatch(showLoaderPopup({
                msg: 'Subiendo imagen de grupo',
            }));

            socket.emit('miniwass-edit-group', { 
                chatId: id, 
                data: { 
                    name: chatName,
                    image: plainFiles[0],
                    description
                }
            });
        }
    }, [ plainFiles, id, socket, chatName, description, dispatch ]);

    useUpdateEffect(() => {
        dispatch(setSelectedUsers({ usersIds }));
    }, [ usersIds ]);

    return (
        <div className="group-info">
            <div className="group__content">
                <ImageInfo 
                    contextMenuId={ `image-group-options-${ id }` }
                    image={ (chat?.image) ? chat?.image : groupDefault }
                    isAdmin={ !!chat?.admins?.includes(user?.id || '') }
                    isGroup
                    onClick={ openFileSelector }
                    onRemovePhoto={ handleRemovePhoto }
                    onShowPhoto={ handleShowImageView }
                    onUploadPhoto={ openFileSelector }
                    showBtnMenuRemovePhoto={ !!chat?.image }
                    text={ `Grupo . ${ participants.length } participantes` }
                    title={ chatName }
                />

                <AddDescription 
                    date={ chat?.createdAt || new Date() } 
                    isAdmin={ !!chat?.admins?.includes(user?.id || '') }
                />

                <ChatFiles />

                <div className="group__participants">
                    <div className="title-participants">
                        <h3>{ participants.length } participantes</h3>
                    </div>

                    <div className="participants">
                        <If condition={ !!chat?.admins?.includes(user?.id || '') }>
                            <GroupParticipant 
                                convertToBtn 
                                btnText="Añadir participante"
                                isAdmin={ !!chat?.admins?.includes(user?.id || '') }
                                authId={ user.id || '' }
                                onClick={ handleAddParticipant }
                            />
                        </If>

                        <For
                            of={ participants }
                            as={ (participant, { key }) => (
                                <GroupParticipant 
                                    key={ `${ participant?.id || '' + key }` }
                                    participant={ participant }
                                    authId={ user.id || '' }
                                    isAdmin={ !!chat?.admins?.includes(participant?.id || '') }
                                    admins={ chat?.admins }
                                    onClick={ () => handleGoToChat(participant?.id || '') }
                                />
                            ) }
                        />
                    </div>
                </div>

                <ContactButton 
                    icon="leave"
                    text="Salir del grupo"
                    action={ handleLeaveOfGroup } 
                />
            </div>
        </div>
    );
}