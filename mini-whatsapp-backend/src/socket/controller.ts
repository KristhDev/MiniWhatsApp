import { Socket, Server } from 'socket.io';

import authEvents from './events/auth';
import chatEvents from './events/chat';
import groupEvents from './events/group';

import models from '../models';

import { checkJWT } from '../validations/auth';

const controller = async (socket: Socket, io: Server) => {
    const token: string = socket.handshake.auth['x-token'];
    const user = await checkJWT(token || '');

    if (!user) return socket.disconnect();

    const chatsIds = await models.chat.find({ users: user?._id , removedFor: { $not: { $in: [ user?._id ] } } })
        .select([ '_id' ]);

    socket.join(chatsIds.map(c => c._id.toString()));

    await authEvents(socket, io, user, chatsIds);
    await chatEvents(socket, io, user);
    await groupEvents(socket, io, user);
}

export default controller;