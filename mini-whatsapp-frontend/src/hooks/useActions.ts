import { useAppDispatch, RootState } from '../features/store';

import { 
    addAdminToMyChats,
    addChat, 
    addUserToMyChats, 
    removeAdminToMyChats, 
    removeChat, 
    removeChatNotifications, 
    removeUserOfMyChats, 
    removeGroupPhoto, 
    removePhoto, 
    replaceCreatorOfMyChats, 
    setChat, 
    setImageGroupToChat, 
    setOnlineContactUser, 
    updateChat, 
    updateUserSettings,
    updateSettingOfContact
} from '../features/auth';

import { 
    addMessage,
    addUserToChatSelected,
    deleteAllMessages,
    deleteMessages,
    loadMessages, 
    loadMoreMessges, 
    removeChatFile, 
    removeUserOfChat, 
    resetChatSelected, 
    setChatSelected, 
    setChatFiles, 
    setNameAndDescription, 
    setOnlineUserChatSelected, 
    setStartLoadMoreMessages, 
    setUsersColors,
    addChatFile,
    replaceCreator,
    updateUserSettingsOfUser
} from '../features/chat';

import { setError } from '../features/error';
import { addFile, clearFiles, hideLoaderPopup, removeFile } from '../features/ui';

import useSocket from './useSocket';

import { SetChat, UserOnline } from '../interfaces/actions';
import { User } from '../interfaces/auth';
import { Message, SetChatSelectedPayload, SetGroupInfo } from '../interfaces/chat';
import { ChatResponse } from '../interfaces/http';

import { 
    AddedParticipantToGroupPayload,
    AppointedAsAdminPayload,
    AssignedCreatorToGroupPayload,
    EditedGroupPayload, 
    GetChatPayload, 
    ReadNotificationsPayload,
    RemovedAdminGroupPayload,
    RemovedGroupPhotoPayload,
    RemovedUserGroupPayload, 
    RemoveUserPhotoPayload,
    UpdatedUserSettingsPayload
} from '../interfaces/socket';


import store from '../features/store';

import { handleGenerateColor } from '../utils/functions';
import wassSwal from '../utils/swal';

const useActions = () => {
    const dispatch = useAppDispatch();
    const socket = useSocket();

    const { user } = (store.getState() as RootState).auth;
    const { chatSelected: { id: chatSelectedId, users }, messages } = (store.getState() as RootState).chats;

    const startSetOnlineContactUser = (userId: string, userOnline: UserOnline) => {
        const { contacts } = (store.getState() as RootState).auth;
        const contactsUsersIds = contacts.map(c => c.contact?._id || '');

        if (contactsUsersIds.includes(userId)) dispatch(setOnlineContactUser({ ...userOnline }));
    }

    const startRemoveUserPhoto = ({ status, msg }: RemoveUserPhotoPayload) => {
        if (status === 200) dispatch(removePhoto()); 
        else dispatch(setError({ msg: msg || '', status }));
    }

    const startGoToChat = (chat: SetChatSelectedPayload) => {
        dispatch(setChatSelected(chat));
        if (messages.length > 0) dispatch(deleteAllMessages());
    }

    const startSetChats = (setChats: SetChat[]) => {
        const { chats } = (store.getState() as RootState).auth;

        setChats.forEach(({ chatId, messages, notifications }) => {
            const chat = chats.find(c => c.id === chatId);

            if (chat && chat.id === chatId) {
                const msg = messages[messages.length - 1];

                dispatch(setChat({ chat: { ...chat, messages: [ msg ], notifications } }));
            }
        });
    }

    const startRemoveChatNotifications = () => {
        const { chats } = (store.getState() as RootState).auth;
        const { chatSelected } = (store.getState() as RootState).chats;

        const notfs = chats.find(chat => chat.id === chatSelected.id)?.notifications || [];

        if (notfs.length > 0 && chatSelected.id === notfs[0].chat) {
            const notfsIds = notfs.map(notf => notf._id);

            socket.emit('miniwass-read-notifications', { notfsIds }, (payload: ReadNotificationsPayload) => {
                if (payload.status === 200) dispatch(removeChatNotifications({ chatId: chatSelected.id }));
                else dispatch(setError({ msg: payload?.msg || '', status: payload?.status }));
            });
        }
    }

    const startAddMessages = (data: SetChat[]) => {
        const { chatSelected } = (store.getState() as RootState).chats;
        const chatsIds = data.map(({ chatId }) => chatId);

        if (chatsIds.includes(chatSelected.id)) {
            const chat = data.find(({ chatId }) => chatId === chatSelected.id);

            if (chat) chat.messages.forEach(m => {
                dispatch(addMessage({ message: m }));

                if (m.src?.image || m.src?.gif) {
                    dispatch(addChatFile({
                        file: {
                            _id: m._id,
                            user: m.user,
                            url: m.src?.image || m.src?.gif || '',
                            createdAt: m.createdAt
                        }
                    }));

                    dispatch(addFile({
                        file: {
                            _id: m._id,
                            user: m.user,
                            url: m.src?.image || m.src?.gif || '',
                            createdAt: m.createdAt
                        }
                    }));
                }
            });
        }
    }

    const startAddMessage = (message: Message) => {
        const { chatSelected } = (store.getState() as RootState).chats;

        if (chatSelected.id === message.chat) {
            dispatch(addMessage({ message }));

            if (message.src?.image || message.src?.gif) {
                dispatch(addChatFile({
                    file: {
                        _id: message._id,
                        user: message.user,
                        url: message.src?.image || message.src?.gif || '',
                        createdAt: message.createdAt
                    }
                }));

                dispatch(addFile({
                    file: {
                        _id: message._id,
                        user: message.user,
                        url: message.src?.image || message.src?.gif || '',
                        createdAt: message.createdAt
                    }
                }));
            }
        }
    }

    const startGetContentOfMessages = (messagesIds: string[]) => {
        let msgs: { content?: string, src?: { image?: string, gif?: string } }[] = [];

        messages.forEach((m) => (messagesIds.includes(m?._id) && msgs.push({ content: m?.content, src: m?.src })));

        return msgs;
    }

    const startDataDeleteMessages = (forMe: boolean, forAll: boolean, messages: string[]) => {
        let usersIds: string[] = [];

        if (forAll) { 
            const ids = users.map(({ id }: User) => id || '').filter(Boolean);

            usersIds = [ ...ids, user?.id || '' ];
        }
        else if (forMe) { 
            usersIds = [ user?.id || '' ];
        }

        const data = {
            chatId: chatSelectedId,
            messagesIds: messages, 
            usersIds
        }

        return data;
    }

    const startSetOnlineUserChatSelected = ({ userId, online, lastConnection }: UserOnline) => {
        const { chatSelected } = (store.getState() as RootState).chats;

        const user = chatSelected.users.find(({ id }) => id === userId);

        if (user) dispatch(setOnlineUserChatSelected({ online, lastConnection, userId }));
    }

    const startSetResendMessages = (status: number, data: SetChat[], msg?: string) => {
        dispatch(hideLoaderPopup());
        if (status === 200) {
            startSetChats(data);
            startAddMessages(data);
        }
        else dispatch(setError({ msg: msg || '', status }));
    }

    const startSetMoreMessages = (status: number, messages?: Message[], msg?: string) => {
        if (status === 200 && (messages || []).length > 0) {
            dispatch(loadMoreMessges({ messages: messages || [] }));
        }
        else if (status === 200) dispatch(setStartLoadMoreMessages({ startLoadMoreMessages: false }));
        else dispatch(setError({ msg: msg || '', status }));
    }

    const startDeleteMessages = (status: number, messagesIds: string[], msg?: string) => {
        const { messages, chatSelected: { id: chatSelectedId, files } } = (store.getState() as RootState).chats;

        if (status === 200) {
            dispatch(deleteMessages({ ids: messagesIds }));

            files.forEach(({ _id }) => {
                if (messagesIds.includes(_id)) {
                    dispatch(removeChatFile({ id: _id }));
                    dispatch(removeFile({ fileId: _id }));	
                }
            });
        }
        else dispatch(setError({ msg: msg || '', status }));

        if (status === 200 && messages.length < 20) {
            socket.emit('miniwass-get-chat', { id: chatSelectedId }, (payload: GetChatPayload) => {
                dispatch(loadMessages({ messages: payload.chat.messages }));
                dispatch(setChatFiles({ files: payload?.files || [] }));
                startRemoveChatNotifications();
            });
        }
    }

    const startSetChatWithLastMessage = (status: number, chat: ChatResponse, msg?: string) => {
        if (status === 200) dispatch(setChat({ chat }));
        else dispatch(setError({ msg: msg || '', status }));
        dispatch(hideLoaderPopup());
    }

    const startDeleteChat = async (chatId: string) => {
        const { isConfirmed } = await wassSwal.fire({
            title: '¿Deseas eliminar este chat?',
            confirmButtonText: 'Eliminar chat',
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            allowOutsideClick: false
        });

        if (isConfirmed) socket.emit('miniwass-delete-chat', { chatId });
    }

    const startRemoveChat = (status: number, chatId?: string, msg?: string) => {
        const { chatSelected } = (store.getState() as RootState).chats;

        if (status === 200) {
            dispatch(removeChat({ chatId: chatId || '' })); 

            if (chatSelected.id === chatId) {
                dispatch(resetChatSelected());
                dispatch(clearFiles());
            }
        }
        else dispatch(setError({ msg: msg || '', status }));
    }

    const startSetGroup = ({ status, group, users, destinations, msg }: SetGroupInfo) => {
        if (status === 200) {
            dispatch(addChat({ chat: group }));

            if (group.admins?.includes(user.id || '')) {
                dispatch(setChatSelected({ 
                    id: group.id,
                    name: group?.name || '',
                    description: group?.description || '',
                    isGroup: group.isGroup,
                    createdBy: group.createdBy || '',
                    destinations,
                    users
                }));

                const usersColors = users.map(({ id }: User) => ({ userId: id || '', color: handleGenerateColor() }));

                dispatch(setUsersColors({ usersColors }));

                const { messages } = (store.getState() as RootState).chats;

                if (messages.length > 0) dispatch(deleteAllMessages());
            }
        }
        else dispatch(setError({ msg: msg || '', status }));
    }

    const startUpdateGroup = ({ chatId, data, status, imageGroup, msg }: EditedGroupPayload) => {
        if (status === 200) {
            dispatch(updateChat({ chatId, data }));

            if (imageGroup) {
                dispatch(setImageGroupToChat({ chatId, image: imageGroup }));
                dispatch(hideLoaderPopup());
            }

            if (chatSelectedId === chatId) {
                dispatch(setNameAndDescription({ name: data.name, description: data.description }));
            }
        }
        else dispatch(setError({ msg: msg || '', status }));
    }

    const startLeaveOfGroup = async (userId: string, admins: string[]) => {
        if (userId === user.id || admins.includes(user?.id || '')) {
            const { isConfirmed } = await wassSwal.fire({
                title: (userId === user.id) ? '¿Deseas salir de este grupo?' : '¿Deseas eliminar a este usuario?',
                showCancelButton: true,
                cancelButtonText: 'CANCELAR',
                confirmButtonText:  (userId === user.id) ? 'SALIR DEL GRUPO' : 'ELIMINAR USUARIO',
                allowOutsideClick: false
            });

            if (isConfirmed) {
                socket.emit('miniwass-remove-user-group', { 
                    chatId: chatSelectedId, 
                    userId 
                });
            }
        }
    }

    const startAppointAsAdmin = async (userId: string, admins: string[]) => {
        if (admins.includes(user?.id || '')) {
            const { isConfirmed } = await wassSwal.fire({
                title: '¿Deseas añadir a este usuario como administrador?',
                showCancelButton: true,
                cancelButtonText: 'CANCELAR',
                confirmButtonText: 'DESIGNAR COMO ADMIN',
                allowOutsideClick: false
            });

            if (isConfirmed) {
                socket.emit('miniwass-appoint-as-admin', {
                    chatId: chatSelectedId, 
                    userId
                });
            }
        }
    }

    const startRemoveAdmin = async (userId: string, creatorId: string) => {
        if (creatorId === user?.id) {
            const { isConfirmed } = await wassSwal.fire({
                title: '¿Deseas quitar a este usuario como administrador?',
                showCancelButton: true,
                cancelButtonText: 'CANCELAR',
                confirmButtonText: 'QUITAR COMO ADMIN',
                allowOutsideClick: false
            });

            if (isConfirmed) {
                const usersPhones = users.map(({ phone }: User) => phone);
                const data = { chatId: chatSelectedId, userId, destinations: usersPhones }

                socket.emit('miniwass-remove-admin-group', data);
            }
        }
    }

    const startRemoveUserOfChat = ({ chatId, userId, msg, status }: RemovedUserGroupPayload) => {
        const { chatSelected } = (store.getState() as RootState).chats;

        if (status === 200) {
            if (user.id === userId) {
                dispatch(removeChat({ chatId }))
                dispatch(resetChatSelected());
            }
            else {
                if (chatSelected.id === chatId) dispatch(removeUserOfChat({ userId }));
                dispatch(removeUserOfMyChats({ userId, chatId }));
            }
        }
        else dispatch(setError({ msg: msg || '', status }));
    }

    const startAddAdminOfGroup = ({ groupId, newAdmin, msg, status }: AppointedAsAdminPayload) => {
        if (status === 200) {
            dispatch(addAdminToMyChats({ chatId: groupId || '', userId: newAdmin || '' }));
        }
        else dispatch(setError({ msg: msg || '', status }));
    }

    const startRemoveAdminOfGroup = ({ groupId, removedAdmin, msg, status }: RemovedAdminGroupPayload) => {
        if (status === 200) {
            dispatch(removeAdminToMyChats({ chatId: groupId || '', userId: removedAdmin || '' }));
        }
        else dispatch(setError({ msg: msg || '', status }));
    }

    const startAddPaticipantToGroup = ({ status, msg, users, groupId }: AddedParticipantToGroupPayload) => {
        const { chatSelected } = (store.getState() as RootState).chats;

        if (status === 200) {
            users?.forEach(user => {
                dispatch(addUserToMyChats({ userId: user?.id || '', chatId: groupId || '' }));

                if (chatSelected.id === groupId) {
                    const usersIds = chatSelected.users.map(({ id }) => id || '');
                    const uId = usersIds.find(id => id === user?.id || '');

                    if (!uId) {
                        dispatch(addUserToChatSelected({ 
                            user: user || {} as User, 
                            destination: user?.phone || '', 
                            userColor: handleGenerateColor()
                        }));
                    }
                }
            });
        }
        else dispatch(setError({ msg: msg || '', status }));
    }

    const startReplaceCreatorToGroup = ({ status, groupId, msg, newCreator }: AssignedCreatorToGroupPayload) => {
        if (status === 200) {
            dispatch(replaceCreatorOfMyChats({ chatId: groupId || '', creatorId: newCreator || '' }));

            if (chatSelectedId === groupId) {
                dispatch(replaceCreator({ creatorId: newCreator || '' }));
            }
        }
        else dispatch(setError({ msg: msg || '', status }));
    }

    const startRemoveGroupPhoto = ({ status, msg, groupId }: RemovedGroupPhotoPayload) => {
        if (status === 200) {
            dispatch(removeGroupPhoto({ chatId: groupId || '' }));
        }
        else dispatch(setError({ msg: msg || '', status }));
    }

    const startUpdateUserSettings = ({ status, msg, settings, userId }: UpdatedUserSettingsPayload) => {
        const { user, contacts } = (store.getState() as RootState).auth;
        const { chatSelected: { users } } = (store.getState() as RootState).chats;

        if (status === 200) {
            if (user.id === userId) {                
                if (settings?.background?.backgrounds?.length > (user?.settings?.background?.backgrounds?.length || 0)) {
                    dispatch(hideLoaderPopup());
                }

                dispatch(updateUserSettings({ settings }));
            }

            const userInChatSelected = users.find(u => u.id === userId);
            if (userInChatSelected) dispatch(updateUserSettingsOfUser({ settings }));

            const contact = contacts.find(c => c.contact?._id === userId);
            if (contact) dispatch(updateSettingOfContact({ settings }));
        }
        else dispatch(setError({ msg: msg || '', status }));
    }

    return {
        startSetOnlineContactUser,
        startRemoveUserPhoto,
        startSetChats,
        startGoToChat,
        startRemoveChatNotifications,
        startAddMessages,
        startAddMessage,
        startGetContentOfMessages,
        startDataDeleteMessages,
        startSetOnlineUserChatSelected,
        startSetResendMessages,
        startSetMoreMessages,
        startDeleteMessages,
        startSetChatWithLastMessage,
        startDeleteChat,
        startRemoveChat,
        startSetGroup,
        startUpdateGroup,
        startAppointAsAdmin,
        startLeaveOfGroup,
        startRemoveUserOfChat,
        startRemoveAdmin,
        startRemoveAdminOfGroup,
        startAddPaticipantToGroup,
        startAddAdminOfGroup,
        startReplaceCreatorToGroup,
        startRemoveGroupPhoto,
        startUpdateUserSettings
    }
}

export default useActions;