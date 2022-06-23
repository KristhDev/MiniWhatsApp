import { useState } from 'react';
import { useUpdateEffect } from 'react-use';
import { If } from '@anissoft/react-conditions';

import { useAppDispatch } from '../../../features/store';

import { removeSelectedMessages, toggleIsSelectedMessages } from '../../../features/chat';
import { showLoaderPopup } from '../../../features/ui';

import { useActions, useAuth, useChat, usePrivacy, useSocket } from '../../../hooks';

import { ElementList, Modal } from '../../ui';

import { handleDownloadImage, handleGetMiniChats } from '../../../utils/functions';
import { ArrowBackIcon, CancelIcon, DownloadIcon, TrashIcon } from '../../../utils/icons';
import wassSwal from '../../../utils/swal';

import userDefault from '../../../assets/images/default-user.jpg';

import './messages-form.scss';

export const MessagesForm = () => {
    const dispatch = useAppDispatch();
    const socket = useSocket();

    const [ chatsIds, setChatsIds ] = useState<string[]>([]);
    const [ confirmedResendMessages, setConfirmedResendMessages ] = useState<boolean>(false);

    const { user, contacts, chats } = useAuth();
    const { isSelectedMessages, selectedMessages, messages } = useChat();
    const { startGetContentOfMessages, startDataDeleteMessages } = useActions();
    const { showUserPrivacy } = usePrivacy();

    const miniChats = handleGetMiniChats(contacts, chats, user).map(mc => 
        mc?.settings ? ({ 
            id: mc.id,
            name: mc.name,
            image: (showUserPrivacy(mc?.settings?.privacy?.profilePhoto, mc.id)) 
                ? mc.image || userDefault
                : userDefault,
            description: (showUserPrivacy(mc?.settings?.privacy?.info, mc.id)) 
                ? mc.description 
                : ''
        }) : ({
            id: mc.id,
            name: mc.name,
            image: mc.image,
            description: mc.description || ''
        })
    );

    const ResendMessageModal = () => {
        return (
            <Modal 
                title="Reenviar mensaje a" 
                onCloseModal={ handleCloseModal }
                children={
                    <ElementList 
                        elements={ miniChats }
                        multipleSelect
                        onChange={ setChatsIds }
                        onConfirm={ handleConfirmModal }
                    />
                } 
            />
        );
    }

    const handleHideSelectionMessages = () => { 
        dispatch(toggleIsSelectedMessages());
        dispatch(removeSelectedMessages()); 
    }

    const handleConfirmModal = () => wassSwal.clickConfirm();
    const handleCloseModal = () => wassSwal.clickCancel();

    const handleDeletingMessages = async () => {
        const { isConfirmed, isDenied, isDismissed } = await wassSwal.fire({
            title: `¿Eliminar ${ selectedMessages.length } mensajes?`,
            showCancelButton: true,
            showDenyButton: true,
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
                actions: 'wass-alert-actions wass-alert-actions-col',
            }
        });

        if (isConfirmed || isDenied) {
            dispatch(showLoaderPopup({ msg: 'Eliminando mensajes' }));
            const data = startDataDeleteMessages(isDenied, isConfirmed, selectedMessages);
            socket.emit('miniwass-delete-messages', data);
        }

        if (isDismissed) dispatch(removeSelectedMessages());
        dispatch(toggleIsSelectedMessages());
    }

    const handlePopupResendMessages = async () => {
        const { isConfirmed } = await wassSwal.fire({
            html: <ResendMessageModal />,
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

        if (isConfirmed) setConfirmedResendMessages(true);

        dispatch(removeSelectedMessages());
        setChatsIds([]);
    }

    const handleDownload = async () => {
        const filesUrl = selectedMessages.map(mId => {
            const msg = messages.find(m => m._id === mId);

            return msg?.src?.image || msg?.src?.gif || '';
        }).filter(Boolean);

        const filesDownloadPromises = filesUrl.map(url => handleDownloadImage(url || ''));
        await Promise.all(filesDownloadPromises);
    }

    const handleShowBtnDownload = () => {
        const fileWithOutUrl = selectedMessages.map(mId => {
            const msg = messages.find(m => m._id === mId);

            return (msg?.src?.image || msg?.src?.gif) ? true : false;
        }).find(url => !url);

        return fileWithOutUrl;
    }

    useUpdateEffect(() => {
        if (confirmedResendMessages) {
            const data = startGetContentOfMessages(selectedMessages);
            const recipients = contacts.map(contact => 
                (chatsIds.includes(contact.chat || '')) && contact.contact?.phone
            );

            socket.emit('miniwass-resend-messages', { 
                contentOfMessages: data, 
                chatsIds,
                userId: user.id,
                recipients
            });

            setConfirmedResendMessages(false);
            dispatch(toggleIsSelectedMessages());
        }
    }, [ confirmedResendMessages ]);

    return (
        <div className={ (isSelectedMessages) ? 'messages-form show-messages-form' : 'messages-form' }>
            <div className="messages-form__info">
                <button onClick={ handleHideSelectionMessages }>
                    <CancelIcon />
                </button>

                <p>{ selectedMessages.length } seleccionados</p>
            </div>

            <div className="messages-form__actions">
                <button 
                    disabled={ selectedMessages.length < 1 } 
                    onClick={ handleDeletingMessages }
                    title={ (selectedMessages.length === 1) ? 'Eliminar mensaje' : 'Eliminar mensajes' }
                >
                    <TrashIcon />
                </button>

                <button 
                    disabled={ selectedMessages.length < 1 } 
                    onClick={ handlePopupResendMessages }
                    title={ (selectedMessages.length === 1) ? 'Reenviar mensaje' : 'Reenviar mensajes' }
                >
                    <ArrowBackIcon />
                </button>

                <If condition={ handleShowBtnDownload() === undefined }>
                    <button
                        className="btn-download"
                        disabled={ selectedMessages.length < 1 }
                        onClick={ handleDownload }
                        title="Descargar"
                    >
                        <DownloadIcon />
                    </button>
                </If>
            </div>
        </div>
    );
}