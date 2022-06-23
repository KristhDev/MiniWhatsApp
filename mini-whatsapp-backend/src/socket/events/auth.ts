import { Server, Socket } from 'socket.io';
import { Types } from 'mongoose';

import { blockedUser, removeBgChat, removePhoto, setBgSelected, unblockedUser, updatePrivacy, uploadNewBgChat } from '../../controllers/auth';

import { UserDocument } from '../../interfaces/user';
import { ChatDocument } from '../../interfaces/chat';
import {
    BlockedUserPayload,
    NewBgChatPayload,
    RemoveBgChatPayload,
    RemoveUserPhotoPayload,
    SetBackgroundSelected,
    UnBlockedUserPayload,
    UpdateUserPrivacyPayload
} from '../../interfaces/socket';

type ChatId = (ChatDocument & {
    _id: any;
});

const authEvents = async (socket: Socket, io: Server, user: UserDocument, chatsIds: ChatId[]) => {
    await user.setOnline();

    socket.join(user.phone);

    const ctIds = chatsIds.map(c => c._id.toString());

    socket.on('disconnect', async () => {
        await user.setOffline();

        io.to([ ...ctIds, user.phone ]).emit('miniwass-online-user', {
            userId: user.id,
            online: user.online,
            lastConnection: user.lastConnection
        });
    });

    io.to([ ...ctIds, user.phone ]).emit('miniwass-online-user', {
        userId: user.id,
        online: user.online,
        lastConnection: user.lastConnection
    });

    socket.on('miniwass-update-user-privacy', async (payload: UpdateUserPrivacyPayload) => {
        const resp = await updatePrivacy(user.id, user.settings?.toString() || '', payload);
        const destinations = (resp.status === 200) ? [ ...ctIds, user.phone ] : [ user.phone ];

        io.to(destinations).emit('miniwass-updated-user-settings', {
            ...resp,
            userId: user.id
        });
    });

    socket.on('miniwass-new-bg-chat', async (payload: NewBgChatPayload) => {
        const resp = await uploadNewBgChat(user.id, user.settings?.toString() || '', payload.backgrounds, payload.newBackground);
        const destinations = (resp.status === 200) ? [ ...ctIds, user.phone ] : [ user.phone ];

        io.to(destinations).emit('miniwass-updated-user-settings', {
            ...resp,
            userId: user.id
        });
    });

    socket.on('miniwass-set-background-selected', async (payload: SetBackgroundSelected) => {
        const resp = await setBgSelected(user.id, user.settings?.toString() || '', payload);
        const destinations = (resp.status === 200) ? [ ...ctIds, user.phone ] : [ user.phone ];

        io.to(destinations).emit('miniwass-updated-user-settings', {
            ...resp,
            userId: user.id
        });
    });

    socket.on('miniwass-remove-bg-chat', async (payload: RemoveBgChatPayload) => {
        const resp = await removeBgChat(user.id, user.settings?.toString() || '', payload.background, payload.bgDefault);
        const destinations = (resp.status === 200) ? [ ...ctIds, user.phone ] : [ user.phone ];

        io.to(destinations).emit('miniwass-updated-user-settings', {
            ...resp,
            userId: user.id
        });
    });

    const sendBlockedUsers = (userId: string, blockedUsers: Types.ObjectId[], destinations: string[]) => {
        io.to(destinations).emit('miniwass-contact-users-blocked', { userId, blockedUsers });
    }

    socket.on('miniwass-blocked-user', async (payload: BlockedUserPayload, callback) => {
        const resp = await blockedUser(user._id, payload.userId);

        if (resp.status === 200) sendBlockedUsers(user._id, resp.blockedUsers || [], payload.destinations);
        callback({ ...resp });
    });

    socket.on('miniwass-unblocked-user', async (payload: UnBlockedUserPayload, callback) => {
        const resp = await unblockedUser(user._id, payload.userId);

        if (resp.status === 200) sendBlockedUsers(user._id, resp.blockedUsers, payload.destinations);
        callback({ ...resp });
    });

    socket.on('miniwass-remove-user-photo', async (payload: RemoveUserPhotoPayload, callback) => {
        const resp = await removePhoto(payload.userId, user._id);

        callback({ ...resp });
    });
}

export default authEvents;