import { Types } from 'mongoose';
import cloudinary from 'cloudinary';

import models from '../models';

import { imBlockedBy } from '../validations/auth';

import { Message, MessageData } from '../interfaces/chat';
import { Notification } from '../interfaces/notification';

import { serverErrorSocket } from '../utils/server-error';

export const getOneWithLastMessage = async (chatId: string, userId: string) => {
    try {
        const chat = await models.chat.findOne({
            _id: chatId,
            users: { $in: [ userId ] },
            removedFor: { $not: { $in: [ userId ] } }
        })
        .select(['-status', '-updatedAt']);

        const message = await models.message
            .findOne({ chat: chatId, removedFor: { $not: { $in: [ userId ] } } })
            .sort({ $natural: -1 });

        const uId = chat?.users.find(u => !u.equals(userId))?.toString() || '';

        const notifications = await models.notification.find({
            chat: chatId,
            readBy: { $not: { $in: [ uId ] } }
        });

        if (chat?.id) {
            chat.messages = message?._id ? [ message ] : [];
            chat.notifications = (notifications.some(n => n)) ? notifications : [];
        }

        return { status: 200, chat }
    }
    catch (error) {
        console.log(error);

        return serverErrorSocket();
    }
}

export const getOne = async (id: string, userId: string) => {
    try {
        const chat = await models.chat.findOne({
            _id: id,
            users: { $in: [ userId ] },
            removedFor: { $not: { $in: [ userId ] } }
        });

        if (!chat || chat.status === 0) return null;

        const messages = await models.message
            .paginate({
                query: { chat: id, removedFor: { $not: { $in: [ userId ] } } },
                sort: { createdAt: -1 },
                select: '-__v',
                populate: { path: 'responseTo', select: '-__v' },
                limit: 20,
                page: 1
            });

        await models.notification.updateMany({ chat: id, readBy: { $not: { $in: [ userId ] } } }, {
            $addToSet: {
                readBy: userId
            }
        });

        const messagesFiles = await models.message.find({ chat: id, removedFor: { $not: { $in: [ userId ] } } })
            .sort({ createdAt: 1 }).select([ 'user', 'src', 'content', 'createdAt' ])

        const usersIds = chat.users.filter(u => !u.equals(userId));

        const users = await models.user.find({ _id: { $in: usersIds } }).populate('settings');
        const usersPhones = users.map(u => u.phone);

        return {
            chat: {
                ...chat,
                id: chat.id,
                name: chat.name || '',
                admins: chat.admins || [],
                users: chat.users,
                removedFor: chat.removedFor,
                messages: messages?.docs.reverse() || [],
                status: chat.status,
                isGroup: chat.isGroup
            },
            usersPhones,
            users,
            files: messagesFiles
                .filter(m => m.src?.image || m.src?.gif)
                .map(m => ({
                    _id: m._id,
                    user: m.user,
                    url: m.src?.image || m.src?.gif,
                    content: m.content,
                    createdAt: (m as any).createdAt
                }))
        };
    }
    catch (error) {
        console.log(error);

        return null;
    }
}

export const getMoreMessages = async (chatId: string, userId: string, page: number) => {
    try {
        const messages = await models.message
            .paginate({
                query: { chat: chatId, removedFor: { $not: { $in: [ userId ] } } },
                sort: { createdAt: -1 },
                select: '-__v',
                populate: { path: 'responseTo', select: '-__v' },
                limit: 20,
                page
            });

        return { messages: messages?.docs.reverse() || [], status: 200 };
    }
    catch (error) {
        console.log(error);

        return serverErrorSocket();
    }
}

export const create = async (message: string, chatId: string, respMsgId: string, userId: string, userPhone: string) => {
    try {
        const chat = await models.chat.findOne({ _id: chatId, status: 1, users: { $in: [ userId ] } });
        if (!chat || chat.status === 0) return {};

        const uId = chat?.users.find(id => !id.equals(userId))?.toString();

        const imBlocked = await imBlockedBy([ uId || '' ], userId);
        const auth = await models.user.findById(userId);

        if ((imBlocked || auth?.isBlocked(uId || '')) && !chat.isGroup) return {};

        let msg: MessageData = { user: userId, chat: chatId, content: message, removedFor: [] };

        if (respMsgId) {
            msg = {
                user: userId,
                chat: chatId,
                responseTo: respMsgId,
                content: message,
                removedFor: []
            };
        }

        const chatUpdated = await models.chat.findByIdAndUpdate(chatId,
            { $pullAll: { removedFor: chat.users } }, { new: true });

        const messageCreated = await models.message.create(msg);
        const msgFinded = await models.message.findById(messageCreated.id).populate('responseTo');

        const destinationContact = await models.contact.findOne({ chat: chatId, contact: userId, status: 1 });

        const notification = await models.notification.create({ chat: chatId, readBy: [ userId ] });

        if (!destinationContact && !chatUpdated?.isGroup) {
            const destinationId = chatUpdated?.users.find(id => !id.equals(userId));

            const contact = new models.contact({
                name: userPhone,
                user: destinationId,
                contact: userId,
                chat: chatId
            });

            await contact.save();
            const contactStored = await models.contact.findOne({ _id: contact.id })
                .populate('contact', ['_id', 'username', 'phone', 'image', 'description', 'blockedUsers', 'lastConnection', 'online', 'settings']);

            return {
                status: 200,
                message: msgFinded,
                notification,
                contact: contactStored,
                chat: {
                    id: chatUpdated?.id,
                    name: chatUpdated?.name || '',
                    admins: chatUpdated?.admins || [],
                    users: chatUpdated?.users,
                    removedFor: chatUpdated?.removedFor,
                    messages: [ msgFinded ],
                    notifications: [ notification ],
                    status: chatUpdated?.status,
                    isGroup: chatUpdated?.isGroup
                }
            }
        }

        return {
            status: 200,
            notification,
            message: msgFinded,
        }
    }
    catch (error) {
        console.log(error);

        return { status: 500 };
    }
}

export const sendMessageWithImage = async (message: string, chatId: string, userId: string, userPhone: string, images: any[]) => {
    try {
        const chat = await models.chat.findOne({ _id: chatId, status: 1, users: { $in: [ userId ] } });
        if (!chat || chat.status === 0) {
            return {
                status: 400,
                msg: 'No se pudo realizar esta acción'
            }
        }

        const uId = chat?.users.find(id => !id.equals(userId))?.toString();

        const imBlocked = await imBlockedBy([ uId || '' ], userId);
        const auth = await models.user.findById(userId);

        if ((imBlocked || auth?.isBlocked(uId || '')) && !chat.isGroup) {
            return {
                status: 400,
                msg: 'Usted no puede enviar mensajes a este usuario'
            }
        }

        const imagesPromises = images.map((image) => {
            const buffer64 = 'data:image/jpeg;base64,' + Buffer.from(image).toString('base64');

            return cloudinary.v2.uploader.upload(buffer64, {
                folder: process.env.CLOUDINARY_FOLDER_CHATS
            });
        });

        const imagesUploaded = await Promise.all(imagesPromises);
        const imagesUrls = imagesUploaded.map(i => i.secure_url);

        const messagesPromises = imagesUrls.map((url, index) => {
            const msg: { user: string; chat: string, content?: string, src?: { image?: string }, removedFor: string[] } = {
                user: userId,
                chat: chatId,
                content: (message.length > 0 && index === 0) ? message : undefined,
                removedFor: [],
                src: { image: url }
            }

            return models.message.create(msg);
        });

        const messages = await Promise.all(messagesPromises);

        const notificationsPromise = imagesUrls.map(() => {
            return models.notification.create({ chat: chatId, readBy: [ userId ] });
        });

        const notifications = await Promise.all(notificationsPromise);

        const chatUpdated = await models.chat.findByIdAndUpdate(chatId,
            { $pullAll: { removedFor: chat.users } }, { new: true });

        const destinationContact = await models.contact.findOne({ chat: chatId, contact: userId, status: 1 });

        if (!destinationContact && !chatUpdated?.isGroup) {
            const destinationId = chatUpdated?.users.find(id => !id.equals(userId));

            const contact = new models.contact({
                name: userPhone,
                user: destinationId,
                contact: userId,
                chat: chatId
            });

            await contact.save();
            const contactStored = await models.contact.findOne({ _id: contact.id })
                .populate('contact', ['_id', 'username', 'phone', 'image', 'description', 'blockedUsers', 'lastConnection', 'online', 'settings']);

            return {
                status: 200,
                msg: '',
                data: [{
                    chatId,
                    notifications,
                    messages
                }],
                contact: contactStored,
                chat: {
                    id: chatUpdated?.id,
                    name: chatUpdated?.name || '',
                    admins: chatUpdated?.admins || [],
                    users: chatUpdated?.users,
                    removedFor: chatUpdated?.removedFor,
                    messages: messages[ messages.length -1 ],
                    notifications: notifications[ notifications.length -1 ],
                    status: chatUpdated?.status,
                    isGroup: chatUpdated?.isGroup
                }
            }
        }

        return {
            status: 200,
            msg: '',
            data: [{
                chatId,
                notifications,
                messages
            }]
        }
    }
    catch (error) {
        console.log(error);

        return serverErrorSocket();
    }
}

export const sendMessageWithGif = async (chatId: string, userId: string, userPhone: string, gif: string) => {
    const chat = await models.chat.findOne({ _id: chatId, status: 1, users: { $in: [ userId ] } });
    if (!chat || chat.status === 0) return {};

    const uId = chat?.users.find(id => !id.equals(userId))?.toString();

    const imBlocked = await imBlockedBy([ uId || '' ], userId);
    const auth = await models.user.findById(userId);

    if ((imBlocked || auth?.isBlocked(uId || ''))) return {};

    const msg = {
        user: userId,
        chat: chatId,
        src: { gif },
        removedFor: []
    }

    const chatUpdated = await models.chat.findByIdAndUpdate(chatId,
        { $pullAll: { removedFor: chat.users } }, { new: true });

    const messageCreated = await models.message.create(msg);

    const destinationContact = await models.contact.findOne({ chat: chatId, contact: userId, status: 1 });

    const notification = await models.notification.create({ chat: chatId, readBy: [ userId ] });

    if (!destinationContact && !chatUpdated?.isGroup) {
        const destinationId = chatUpdated?.users.find(id => !id.equals(userId));

        const contact = new models.contact({
            name: userPhone,
            user: destinationId,
            contact: userId,
            chat: chatId
        });

        await contact.save();
        const contactStored = await models.contact.findOne({ _id: contact.id })
            .populate('contact', ['_id', 'username', 'phone', 'image', 'description', 'blockedUsers', 'lastConnection', 'online', 'settings']);

        return {
            status: 200,
            msg: '',
            data: [{
                chatId,
                notifications: [ notification ],
                messages: [ messageCreated ]
            }],
            contact: contactStored,
            chat: {
                id: chatUpdated?.id,
                name: chatUpdated?.name || '',
                admins: chatUpdated?.admins || [],
                users: chatUpdated?.users,
                removedFor: chatUpdated?.removedFor,
                messages: [ messageCreated ],
                notifications: [ notification ],
                status: chatUpdated?.status,
                isGroup: chatUpdated?.isGroup
            }
        }
    }

    return {
        status: 200,
        msg: '',
        data: [{
            chatId,
            notifications: [ notification ],
            messages: [ messageCreated ]
        }]
    }
}

export const resendMessages = async (userId: string, authPhone: string, chatsIds: string[], contentOfMessages: { content?: string; src?:{ image?:string; gif?: string } }[]) => {
    const chatsPromise = chatsIds.map(chatId => {
        return models.chat.findOne({ _id: chatId, users: { $in: [ userId ] } });
    });

    const chats = await Promise.all(chatsPromise);
    const chatNotExist = chats.find(chat => !chat);

    if (chatNotExist === null) return serverErrorSocket();

    const usersIds = chats.map(chat => chat?.users.find(id => !id.equals(userId))?.toString())
        .filter(id => id) as string[];

    const imBlocked = await imBlockedBy(usersIds, userId);
    const auth = await models.user.findById(userId);

    const isBlocked = usersIds.map(id => !!auth?.isBlocked(id));

    if (imBlocked || isBlocked.some(blocked => blocked)) return serverErrorSocket();

    let messagesPromise: Message[] = [];
    let notificationsPromise: Notification[] = [];

    contentOfMessages.forEach(({ content, src }) => {
        chatsIds.forEach(chatId => {
            const msgResend = {
                user: new Types.ObjectId(userId),
                chat: new Types.ObjectId(chatId),
                isResending: true,
                content,
                src,
                removedFor: []
            }

            const notification = {
                chat: new Types.ObjectId(chatId),
                readBy: [ new Types.ObjectId(userId) ]
            }

            messagesPromise = [ ...messagesPromise, msgResend ];
            notificationsPromise = [ ...notificationsPromise, notification ];
        });
    });

    const messagesResending = await models.message.insertMany(messagesPromise);
    const notifications = await models.notification.insertMany(notificationsPromise);

    const data = chatsIds.map(chatId => {
        const messagesChat = messagesResending.filter(msg => msg.chat.equals(chatId));
        const notificationsChat = notifications.filter(notif => notif.chat.equals(chatId));

        return {
            chatId,
            messages: messagesChat,
            notifications: notificationsChat
        }
    });

    const notGroups = chats.filter(chat => !chat?.isGroup);

    if (notGroups.length > 0) {
        const uIds = notGroups.map(chat => chat?.users.find(id => !id.equals(userId))?.toString());

        const contactsPromise = uIds.map(id => models.contact.findOne({ user: id, contact: userId }));
        const contacts = await Promise.all(contactsPromise);

        const contactsUsersIds = contacts.map(contact => contact?.user?.toString()).filter(Boolean);
        const noCUids = uIds.filter(id => !contactsUsersIds.includes(id)) as string[];

        if (noCUids.length > 0) {
            const chatsNoContacts = notGroups.map(chat => ({
                id: chat?.id,
                users: chat?.users.filter(id => !id.equals(userId)) || []
            }));

            const contactsPromises = noCUids.map(id => new models.contact({
                name: authPhone,
                user: id,
                contact: userId,
                chat: chatsNoContacts.find(chat => chat?.users[0]?.equals(id))?.id
            }).save());

            const newContacts = await Promise.all(contactsPromises);
            const contactsStored = await models.contact.find({ _id: { $in: newContacts.map(contact => contact?._id) } })
                .populate('contact', ['_id', 'username', 'phone', 'image', 'description', 'blockedUsers', 'lastConnection', 'online', 'settings']);

            const contactsAndChats = contactsStored.map(contact => ({
                contact,
                chat: notGroups.find(chat => chat?._id.equals(contact?.chat))
            }));

            const usersIdsByChats = contactsAndChats.map((cac) => cac?.chat?.users.find(id => !id.equals(userId))?.toString());
            const usersPhones = await models.user.find({ _id: { $in: usersIdsByChats } }).select('phone');

            const chatsWithContacts = contactsAndChats.map(cac => {
                const messagesByChat = data.find(d => d.chatId === cac?.chat?._id.toString())?.messages || [];
                const notificationsByChat = data.find(d => d.chatId === cac?.chat?._id.toString())?.notifications || [];

                return {
                    ...cac,
                    chat: {
                        id: cac?.chat?.id,
                        name: cac?.chat?.name || '',
                        admins: cac?.chat?.admins || [],
                        users: cac?.chat?.users,
                        removedFor: cac?.chat?.removedFor,
                        status: cac?.chat?.status,
                        isGroup: cac?.chat?.isGroup,
                        messages: messagesByChat[ messagesByChat?.length - 1 ],
                        notifications: notificationsByChat,
                    },
                    phone: usersPhones.find(user => user?._id.equals(cac?.contact?.user))?.phone
                }
            });

            return {
                status: 200,
                msg: 'Mensajes reenviados satisfactoriamente',
                data,
                chatsWithContacts
            }
        }
    }

    return {
        status: 200,
        msg: 'Mensajes reenviados satisfactoriamente',
        data
    }
}

export const readNotifications = async (nofts: string[], userId: string) => {
    try {
        await models.notification.updateMany({ _id: { $in: nofts } }, {
            $addToSet: { readBy: userId }
        });

        return { status: 200 }
    }
    catch (error) {
        console.log(error);

        return serverErrorSocket();
    }
}

export const deleteMessages = async (chatId: string, usersIds: string[], messagesIds: string[]) => {
    try {
        const messagesDeletedPromise = messagesIds.map(msgId => {
            return models.message.findOneAndUpdate(
                { chat: chatId, _id: msgId },
                {
                    $addToSet: {
                        removedFor: usersIds
                    }
                },
                {
                    arrayFilters: [{ '_id': msgId }],
                    multi: true
                }
            );
        });

        await Promise.all(messagesDeletedPromise);

        return { status: 200 }
    }
    catch (error) {
        console.log(error);

        return serverErrorSocket();
    }
}

export const deleteAllForMe = async (chatId: string, userId: string) => {
    try {
        await models.message.updateMany({ chat: chatId, users: { $in: [ userId ] } }, {
            $addToSet: {
                removedFor: userId
            }
        });

        return { status: 200 }
    }
    catch (error) {
        console.log(error);

        return serverErrorSocket();
    }
}

export const deleteChatForMe = async (chatId: string, userId: string) => {
    try {
        await models.chat.findOneAndUpdate({ _id: chatId, users: { $in: [ userId ] } }, {
            $addToSet: {
                removedFor: userId,
            }
        });

        await models.message.updateMany({ chat: chatId }, {
            $addToSet: {
                removedFor: userId,
            }
        });

        return { status: 200, chatId }
    }
    catch (error) {
        console.log(error);

        return serverErrorSocket();
    }
}