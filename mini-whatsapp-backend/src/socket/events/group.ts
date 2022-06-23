import { Server, Socket } from 'socket.io';

import {
    addAdminOfGroup,
    addUserOfGroup,
    assignCreatorToGroup,
    createGroup,
    removeAdminOfGroup,
    removeUserOfGroup,
    updateGroup,
    removePhotoOfGroup
} from '../../controllers/group';

import {
    AddParticipantToGroupPayload,
    AppointAsAdminPayload,
    AssignCreatorToGroupPayload,
    CreateGroupPayload,
    EditGroupPayload,
    RemoveAdminGroupPayload,
    RemoveGroupPhotoPayload,
    RemoveUserGroupPayload
} from '../../interfaces/socket';

import { UserDocument } from '../../interfaces/user';

const groupEvents = async (socket: Socket, io: Server, user: UserDocument) => {
    socket.on('miniwass-create-group', async (payload: CreateGroupPayload) => {
        const resp = await createGroup({
            name: payload.name,
            usersIds: payload.usersIds,
            authId: user?._id,
            image: payload?.image
        });

        const destinations = (resp.status === 200) ? [ ...payload.usersPhones, user.phone ] : [ user.phone ];

        if (resp.status === 200) socket.join((resp as any).group.id);

        io.to(destinations).emit('miniwass-new-group', {
            ...resp,
            destinations: (resp.status === 200) ? payload.usersPhones : undefined
        });
    });

    socket.on('miniwass-edit-group', async (payload: EditGroupPayload) => {
        const resp = await updateGroup(payload.chatId, {
            name: payload.data?.name,
            description: payload.data?.description
        }, user.id, payload.data?.image);

        const destination = (resp.status === 200) ? payload.chatId : user.phone;

        io.to(destination).emit('miniwass-edited-group', { ...resp, ...payload });
    });

    socket.on('miniwass-add-participant-to-group', async (payload: AddParticipantToGroupPayload) => {
        const resp = await addUserOfGroup(payload.groupId, payload.usersIds, user.id);
        const destination = (resp.status === 200) ? payload.groupId : user.phone;

        io.to(destination).emit('miniwass-added-participant-to-group', {
            status: resp.status,
            msg: (resp as any)?.msg,
            users: (resp.status === 200) ? (resp as any)?.users : undefined,
            groupId: (resp.status === 200) ? payload.groupId : undefined
        });
    });

    socket.on('miniwass-remove-user-group', async (payload: RemoveUserGroupPayload) => {
        const resp = await removeUserOfGroup(payload.chatId, payload.userId, user._id);
        const destination = (resp.status === 200) ? payload.chatId : user.phone;

        io.to(destination).emit('miniwass-removed-user-group', {
            ...resp,
            userId: (resp.status === 200) ? payload.userId : undefined,
            chatId: (resp.status === 200) ? payload.chatId : undefined
        });
    });

    socket.on('miniwass-appoint-as-admin', async (payload: AppointAsAdminPayload) => {
        const resp = await addAdminOfGroup(payload.chatId, payload.userId, user.id);
        const destination = (resp.status === 200) ? payload.chatId : user.phone;

        io.to(destination).emit('miniwass-appointed-as-admin', {
            ...resp,
            groupId: (resp.status === 200) ? payload.chatId : undefined,
            newAdmin: (resp.status === 200) ? payload.userId : undefined
        });
    });

    socket.on('miniwass-remove-admin-group', async (payload: RemoveAdminGroupPayload) => {
        const resp = await removeAdminOfGroup(payload.chatId, payload.userId, user.id);
        const destination = (resp.status === 200) ? payload.chatId : user.phone;

        io.to(destination).emit('miniwass-removed-admin-group', {
            ...resp,
            groupId: (resp.status === 200) ? payload.chatId : undefined,
            removedAdmin: (resp.status === 200) ? payload.userId : undefined
        });
    });

    socket.on('miniwass-assign-creator-to-group', async (payload: AssignCreatorToGroupPayload) => {
        const resp = await assignCreatorToGroup(payload.groupId, payload.newCreatorId, user.id);
        const destination = (resp.status === 200) ? payload.groupId : user.phone;

        io.to(destination).emit('miniwass-assigned-creator-to-group', {
            ...resp,
            groupId: (resp.status === 200) ? payload.groupId : undefined,
            newCreator: (resp.status === 200) ? payload.newCreatorId : undefined
        });

        if (resp.status === 200) io.to(user.phone).emit('miniwass-leave-of-group');
    });

    socket.on('miniwass-remove-group-photo', async (payload: RemoveGroupPhotoPayload) => {
        const resp = await removePhotoOfGroup(payload.groupId, user.id);
        const destination = (resp.status === 200) ? payload.groupId : user.phone;

        io.to(destination).emit('miniwass-removed-group-photo', {
            ...resp,
            groupId: (resp.status === 200) ? payload.groupId : undefined
        });
    });
}

export default groupEvents;