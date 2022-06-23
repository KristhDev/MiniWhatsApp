import { Server, Socket } from 'socket.io';

import {
    create,
    deleteAllForMe,
    deleteChatForMe,
    deleteMessages,
    getMoreMessages,
    getOne,
    getOneWithLastMessage,
    readNotifications,
    resendMessages,
    sendMessageWithGif,
    sendMessageWithImage
} from '../../controllers/chat';

import { UserDocument } from '../../interfaces/user';

import {
    CleanChatForMePayload,
    DeleteChatPayload,
    DeleteMessagesPayload,
    GetChatPayload,
    GetMoreMessagesPayload,
    ReadNotificationsPayload,
    ResendMessagesPayload,
    SendMessageGifPayload,
    SendMessageImagePayload,
    SendMessagePayload
} from '../../interfaces/socket';

const chatEvents = async (socket: Socket, io: Server, user: UserDocument) => {
    socket.on('miniwass-send-message', async (payload: SendMessagePayload) => {
        const data = await create(payload.message, payload.chatSelected.id, payload.chatSelected.respMsgId, user.id, user.phone);
        const resp = await getOneWithLastMessage(payload.chatSelected.id, user.id);

        io.to([ payload.chatSelected.id, ...payload.chatSelected.destinations ]).emit('miniwass-recived-message', { status: data.status, message: data?.message });
        io.to(payload.chatSelected.destinations).emit('miniwass-send-notification', { status: data.status });
        io.to([ payload.chatSelected.id, ...payload.chatSelected.destinations ]).emit('miniwass-send-chat-with-last-message', resp);

        if (data?.contact) {
            io.to(payload.chatSelected.destinations).emit('miniwass-send-new-contact', {
                contact: data?.contact,
                chat: data?.chat
            });
        }
    });

    socket.on('miniwass-send-message-image', async (payload: SendMessageImagePayload) => {
        const resp = await sendMessageWithImage(payload.message, payload.chatId, user.id, user.phone, payload.images);

        io.to([ payload.chatId, ...payload.destinations ]).emit('miniwass-send-rensend-messages', { ...resp });
        io.to(payload.destinations).emit('miniwass-send-notification', { status: resp.status });

        if ((resp as any)?.contact) {
            io.to(payload.destinations).emit('miniwass-send-new-contact', {
                contact: (resp as any)?.contact,
                chat: (resp as any)?.chat
            });
        }
    });

    socket.on('miniwass-send-message-gif', async (payload: SendMessageGifPayload) => {
        const resp = await sendMessageWithGif(payload.chatId, user.id, user.phone, payload.gif);

        io.to([ payload.chatId, ...payload.destinations ]).emit('miniwass-send-rensend-messages', { ...resp });
        io.to(payload.destinations).emit('miniwass-send-notification', { status: resp.status });

        if (resp?.contact) {
            io.to(payload.destinations).emit('miniwass-send-new-contact', {
                contact: resp?.contact,
                chat: resp?.chat
            });
        }
    });

    socket.on('miniwass-resend-messages', async (payload: ResendMessagesPayload) => {
        const resp = await resendMessages(payload.userId, user.phone, payload.chatsIds, payload.contentOfMessages);

        io.to([ ...payload.chatsIds, ...payload.recipients ]).emit('miniwass-send-rensend-messages', {
            status: resp?.status,
            msg: resp?.msg,
            data: (resp as any)?.data
        });

        io.to(payload.recipients).emit('miniwass-send-notification', { status: resp.status });

        if ((resp as any)?.chatsWithContacts?.length > 0) {
            (resp as any)?.chatsWithContacts.forEach((cwc: any) => {
                io.to(cwc.phone).emit('miniwass-send-new-contact', {
                    contact: cwc?.contact,
                    chat: cwc?.chat
                });

                io.to(cwc.phone).emit('miniwass-send-rensend-messages', {
                    status: resp?.status,
                    msg: resp?.msg,
                    data: (resp as any)?.data
                });
            })
        }
    });

    socket.on('miniwass-read-notifications', async (payload: ReadNotificationsPayload, callback) => {
        const resp = await readNotifications(payload.notfsIds, user.id);

        callback({ ...resp });
    });

    socket.on('miniwass-get-chat', async (payload: GetChatPayload, callback) => {
        const resp = await getOne(payload.id, user._id);
        socket.join(payload.id);

        if (resp?.chat && resp?.usersPhones) {
            callback({
                chat: resp?.chat,
                usersPhones: resp?.usersPhones,
                users: resp?.users,
                files: resp?.files
            });
        }
    });

    socket.on('miniwass-get-more-messages', async (payload: GetMoreMessagesPayload) => {
        const messages = await getMoreMessages(payload.chatId, user._id, payload.page);

        io.to(user.phone).emit('miniwass-send-more-messages', messages);
    });

    socket.on('miniwass-delete-messages', async (payload: DeleteMessagesPayload) => {
        const data = await deleteMessages(payload.chatId, payload.usersIds, payload.messagesIds);
        const resp = await getOneWithLastMessage(payload.chatId, user.id);

        io.to(payload.chatId).emit('miniwass-deleted-messages', { ...data, messagesIds: payload.messagesIds });
        io.to(payload.chatId).emit('miniwass-send-chat-with-last-message', resp);
    });

    socket.on('miniwass-clean-chat-for-me', async (payload: CleanChatForMePayload, callback) => {
        const data = await deleteAllForMe(payload.chatId, user._id);
        const chat = await getOneWithLastMessage(payload.chatId, user._id);

        callback({ resp: { ...data, chat: (chat as any)?.chat || {} } });
    });

    socket.on('miniwass-delete-chat', async (payload: DeleteChatPayload) => {
        const resp = await deleteChatForMe(payload.chatId, user._id);

        io.to(user.phone).emit('miniwass-deleted-chat', resp);
    });
}

export default chatEvents;