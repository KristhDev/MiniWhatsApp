import { useState, useEffect } from 'react';
import { useUpdateEffect } from 'react-use';
import { If } from '@anissoft/react-conditions';
import { For } from 'react-loops';
import dayjs from 'dayjs';

import { useAppDispatch } from '../../../features/store';

import { clearFiles, hideImageView, setFileIndex as setFileIndexStore, clearFileViewType } from '../../../features/ui';

import { useAuth, useChat, usePrivacy, useSocket, useUi } from '../../../hooks';

import { ElementList } from '../ElementList';
import { Modal } from '../Modal';

import { MessageFile } from '../../../interfaces/chat';

import { handleDownloadImage, handleFormatDate, handleGetMiniChats } from '../../../utils/functions';
import { ArrowBackIcon, ArrowDownIcon, CancelIcon, DownloadIcon } from '../../../utils/icons';
import wassSwal from '../../../utils/swal';

import userDefault from '../../../assets/images/default-user.jpg';
import groupDefault from '../../../assets/images/group-default.png';

import './file-view.scss';

export const FileView = () => {
    const dispatch = useAppDispatch();
    const socket = useSocket();

    const { chats, user, contacts } = useAuth();
    const { chatSelected } = useChat();
    const { showImageView, files, fileIndex: fileIndexStore, fileViewType } = useUi();
    const { showUserPrivacy } = usePrivacy();

    const [ selectedFile, setSelectedFile ] = useState<MessageFile>(files[fileIndexStore]);
    const [ fileIndex, setFileIndex ] = useState<number>(fileIndexStore);
    const [ chatsIds, setChatsIds ] = useState<string[]>([]);
    const [ confirmedResendFile, setConfirmedResendFile ] = useState<boolean>(false);

    const chat = chats.find(({ id }) => id === chatSelected.id);
    const userId = chat?.users.find((id) => id !== user.id);
    const contact = contacts.find(({ contact }) => contact?._id === userId);

    const userFileId = files[fileIndex]?.user;
    const userFile = chatSelected.users.find(({ id }) => id === userFileId);

    const showUserImage = showUserPrivacy(userFile?.settings?.privacy?.profilePhoto || 'all', userFile?.id || '');

    const miniChats = handleGetMiniChats(contacts, chats, user).map(mc => 
        mc?.settings ? ({ 
            id: mc.id,
            name: mc.name,
            image: (showUserPrivacy(mc?.settings?.privacy?.profilePhoto, mc.id)) ? mc.image : userDefault,
            description: (showUserPrivacy(mc?.settings?.privacy?.info, mc.id)) ? mc.description : ''
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

    const handleConfirmModal = () => wassSwal.clickConfirm();
    const handleCloseModal = () => wassSwal.clickCancel();

    const handleHideImageView = () => {
        dispatch(hideImageView());

        setTimeout(() => {
            dispatch(clearFiles());
            dispatch(setFileIndexStore({ fileIndex: 0 }));
            dispatch(clearFileViewType());
        }, 400);
    }

    const handleGetChatName = () => {
        if (fileViewType === 'profile') return user?.phone;

        const name = (chat?.isGroup) 
            ? chat?.name 
            : (contact?.name === contact?.contact?.phone)
                ? contact?.contact?.phone
                : contact?.name;

        if (files.length > 1 || fileViewType === 'message') {
            const userFileId = files[fileIndex]?.user;
            if (user.id === userFileId) return 'Tú';

            const userFile = chatSelected.users?.find(({ id }) => id === userFileId);
            const contactFile = contacts.find(({ contact }) => contact?._id === userFileId);

            return (contactFile) ? contactFile.name : userFile?.phone;
        }

        return name;
    }

    const handleDateFormat = () => {
        let date = handleFormatDate(selectedFile?.createdAt || new Date());

        if (dayjs().diff(selectedFile?.createdAt || new Date(), 'days') > 0) {
            date = date + ' a la(s) ' + dayjs(selectedFile?.createdAt || new Date()).format('h:mm a');
        }
        else date = 'hoy a la(s) ' + date;

        return date;
    }

    const handleGetChatPhoto = () => {
        if (user?.id === userFileId && fileViewType === 'message') {
            return (showUserImage) ? (user?.image || userDefault) : userDefault;
        }
        if (fileViewType === 'profile') return user?.image || userDefault;

        const image = (chat?.isGroup)
            ? chat?.image || groupDefault
            : showUserImage ? (userFile?.image || userDefault) : userDefault;

        return image;
    }

    const handleSelectedFile = (file: MessageFile, index: number) => {
        setSelectedFile(file);
        setFileIndex(index);
    }

    const handlePopupResendMessage = async () => {
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

        if (isConfirmed) setConfirmedResendFile(true);
        setChatsIds([]);
    }

    useEffect(() => {
        setSelectedFile(files[fileIndexStore]);
        setFileIndex(fileIndexStore);
    }, [ files, fileIndexStore ]);

    useUpdateEffect(() => {
        if (confirmedResendFile) {
            const data = [{
                content: selectedFile?.content,
                src: {
                    image: (selectedFile.url.includes('mini-whatsapp')) ? selectedFile?.url : undefined,
                    gif: (!selectedFile.url.includes('mini-whatsapp')) ? selectedFile?.url : undefined,
                }
            }];

            const recipients = contacts.map(contact => 
                (chatsIds.includes(contact.chat || '')) && contact.contact?.phone
            ).filter(Boolean);

            setConfirmedResendFile(false);

            socket.emit('miniwass-resend-messages', { 
                contentOfMessages: data, 
                chatsIds,
                userId: user.id,
                recipients
            });
        }
    }, [ confirmedResendFile ]);

    return (
        <div className={ (showImageView) ? 'file-view show-file-view' : 'file-view' }>
            <div className="file-view__chat">
                <div className="chat-info">
                    <div className="chat-info__image">
                        <img src={ handleGetChatPhoto() } alt="" />
                    </div>

                    <div className="chat-info__user">
                        <p>{ handleGetChatName() } { (chat?.isGroup && fileViewType === 'message') ? `@ ${ chat?.name }` : '' }</p>

                        <If condition={ fileViewType === 'message' }>
                            <small>{ handleDateFormat() }</small>
                        </If>
                    </div>
                </div>

                <div className="chat-actions">
                    <If condition={ fileViewType === 'message' }>
                        <>
                            <button 
                                className="btn-m btn-resend" 
                                onClick={ handlePopupResendMessage }
                                title="Reenviar"
                            >
                                <ArrowBackIcon />
                            </button>

                            <button 
                                className="btn-m" 
                                onClick={ () => handleDownloadImage(selectedFile?.url) }
                                title="Descargar"
                            >
                                <DownloadIcon />
                            </button>
                        </>
                    </If>

                    <button 
                        onClick={ handleHideImageView }
                        title="Cerrar"
                    >
                        <CancelIcon />
                    </button>
                </div>
            </div>

            <div className="file-view__content">
                <If condition={ files.length > 1 }>
                    <div className="btn-container">
                        <button 
                            className={ (fileIndex === 0) ? 'btn-prev btn-disabled' : 'btn-prev' }
                            onClick={ () => handleSelectedFile(files[fileIndex - 1], fileIndex - 1) }
                            disabled={ fileIndex === 0 }
                        >
                            <ArrowDownIcon />
                        </button>
                    </div>
                </If>

                <div className="file">
                    <img 
                        src={ (showUserImage || fileViewType !== 'contact') ? selectedFile?.url : userDefault } 
                        alt="" 
                    />

                    <small>{ selectedFile?.content }</small>
                </div>

                <If condition={ files.length > 1 }>
                    <div className="btn-container">
                        <button 
                            className={ (files.length === fileIndex + 1) ? 'btn-next btn-disabled' : 'btn-next' }
                            onClick={ () => handleSelectedFile(files[fileIndex + 1], fileIndex + 1) }
                            disabled={ files.length === fileIndex + 1 }
                        >
                            <ArrowDownIcon />
                        </button>
                    </div>
                </If>
            </div>

            <If condition={ files.length > 1 }>
                <div className="file-view__more">
                    <For
                        of={ files }
                        children={ (file, { index }) => (
                            <div 
                                onClick={ () => handleSelectedFile(file, index) } 
                                className={ (fileIndex === index) ? 'more-item more-item-active' : 'more-item ' }
                            >
                                <img src={ file.url } alt="" />
                            </div>
                        ) }
                    />
                </div>
            </If>
        </div>
    );
}