import { Request, Response } from 'express';
import { Types } from 'mongoose';
import cloudinary from 'cloudinary';

import models from '../models';

import global from '../enviroment/global';

import { UserDocument } from '../interfaces/user';
import { ChatDocument } from '../interfaces/chat';
import { SetBackgroundSelected, UpdateUserPrivacyPayload } from '../interfaces/socket';

import { deleteImage } from '../utils/delete-image';
import { sendRes } from '../utils/send-res';
import { serverError, serverErrorSocket } from '../utils/server-error';

const getAuthData = async (user: UserDocument) => {
    const tokenPromise = user.generateJWT(user.id);
    const contactsPromise = models.contact.find({ user: user?._id, status: 1 }).select('-status')
        .populate([
            {
                path: 'contact',
                select: [ '-name', '-surname', '-password', '-createdAt', '-updatedAt', '-__v', '-status' ],
                model: models.user,
                populate: [
                    {
                        path: 'settings',
                        model: models.setting,
                    }
                ]
            }
        ]);

    const chatsPromise = models.chat.find({ users: user?._id , removedFor: { $not: { $in: [ user?._id ] } } })
        .select(['-status', '-updatedAt']);

    const [ token, contacts, chats ] = await Promise.all([ tokenPromise, contactsPromise, chatsPromise ]);

    return {
        token,
        contacts,
        chats
    }
}

const assignMsgsAndNtsToChats = async (chats: ChatDocument[], userId: Types.ObjectId) => {
    const chatsIds = chats.map(c => c._id);

    const messages = await models.message.aggregate([
        { $match: { chat: { $in: chatsIds } } },
        { $match: { removedFor: { $not: { $in: [ userId ] } } } },
        { $group: { _id: '$chat', messages: { $push: '$$ROOT' } } },
        { $unwind: '$_id' },
        { $project: { messages: { $slice: [ '$messages', -1 ] } } }
    ]);

    let notifications = await models.notification.aggregate([
        { $match: { chat: { $in: chatsIds } } },
        { $match: { readBy: { $not: { $in: [ userId ] } } } },
        { $group: { _id: '$chat', notifications: { $push: '$$ROOT' } } },
        { $unwind: '$_id' }
    ]);

    notifications = notifications.filter(n => n);

    chats.forEach(c => {
        const lastMessage = messages.find(m => c._id.equals(m._id));
        const notifs = notifications.find(n => n._id.equals(c._id));

        c.messages = lastMessage?.messages || [];
        c.notifications = notifs?.notifications || [];
    });

    return chats;
}

export const create = async (req: Request, res: Response) => {
    const { body } = req;
    const user = new models.user(body);

    try {
        await user.save();

        const settings = new models.setting({
            user: user.id,
            background: {
                backgroundSelected: process.env.BACKGROUND_GRAY_URL,
                backgrounds: [ process.env.BACKGROUND_GRAY_URL, process.env.BACKGROUND_GREEN_URL ]
            }
        });

        await settings.save();

        user.settings = settings._id;
        await user.save();

        const token = await user.generateJWT(user.id);

        return res.status(201).json({
            user: {
                id: user.id,
                name: user.name,
                surname: user.surname,
                username: user.username,
                description: user.description,
                phone: user.phone,
                status: user.status,
                image: user.image,
                blockedUsers: user.blockedUsers,
                lastConnection: user.lastConnection,
                online: user.online,
                settings
            },
            token,
            chats: [],
            contacts: [],
            status: 201
        });
    }
    catch (error) {
        return serverError(res, error);
    }
}

export const login = async (req: Request, res: Response) => {
    const { phone, password } = req.body;

    try {
        const user = await models.user.findOne({ phone }).populate('settings');

        if (!(user?.comparePassword(password))) {
            return sendRes(res, 'El número telefónico o la contraseña no son validos', 400);
        }

        const { chats, contacts, token } = await getAuthData(user);
        const chatsWithMsgsAndNts = await assignMsgsAndNtsToChats(chats, user?._id);

        return res.status(200).json({
            user,
            contacts,
            chats: chatsWithMsgsAndNts,
            token,
            status: 200
        });
    }
    catch (error) {
        return serverError(res, error);
    }
}

export const renew = async (req: Request, res: Response) => {
    try {
        const user = global.user;

        const { chats, contacts, token } = await getAuthData(user);
        const chatsWithMsgsAndNts = await assignMsgsAndNtsToChats(chats, user?._id);

        global.user = {} as UserDocument;

        return res.status(200).json({
            user,
            contacts,
            chats: chatsWithMsgsAndNts,
            token,
            status: 200
        });
    }
    catch (error) {
        return serverError(res, error);
    }
}

export const update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { id: docId, _id, phone, password, ...rest } = req.body;
    const image = Array.isArray(req.files?.image) ? req.files?.image[0] : req.files?.image;

    const user = global.user;

    try {
        if (image) {
            if (user?.image) await deleteImage(user.image);

            const { secure_url } = await cloudinary.v2.uploader.upload(image.tempFilePath, {
                folder: process.env.CLOUDINARY_FOLDER_USERS
            });

            rest.image = secure_url;
        }

        const userUpdated = await models.user.findByIdAndUpdate(id, { ...rest }, { new: true });

        global.user = {} as UserDocument;

        return res.status(200).json({
            user: userUpdated,
            msg: 'Perfil actualizado correctamente',
            status: 200
        });
    }
    catch (error) {
        return serverError(res, error);
    }
}

export const updatePrivacy = async (authId: string, settingId: string, privacy: UpdateUserPrivacyPayload) => {
    try {
        const settings = await models.setting.findOneAndUpdate({ _id: settingId, user: authId }, { privacy }, { new: true });

        return {
            status: 200,
            settings
        }
    }
    catch (error) {
        console.log(error);

        return serverErrorSocket();
    }
}

export const setBgSelected = async (authId: string, settingId: string, background: SetBackgroundSelected) => {
    try {
        const settings = await models.setting.findOneAndUpdate({ _id: settingId, user: authId }, { background }, { new: true });

        return {
            status: 200,
            settings
        }
    }
    catch (error) {
        console.log(error);

        return serverErrorSocket();
    }
}

export const uploadNewBgChat = async (authId: string, settingId: string, backgrounds: string[], image: any) => {
    try {
        const buffer64 = 'data:image/jpeg;base64,' + Buffer.from(image).toString('base64');

        const { secure_url } = await cloudinary.v2.uploader.upload(buffer64, {
            folder: process.env.CLOUDINARY_FOLDER_BACKGROUNDS
        });

        const background = {
            backgroundSelected: secure_url,
            backgrounds: [ ...backgrounds, secure_url ]
        }

        const settings = await models.setting.findOneAndUpdate({ _id: settingId, user: authId }, { background }, { new: true });

        return {
            status: 200,
            settings
        }

    }
    catch (error) {
        console.log(error);

        return serverErrorSocket();
    }
}

export const removeBgChat = async (authId: string, settingId: string, bg: string, bgDefault: string) => {
    try {
        if (bg === process.env.BACKGROUND_GRAY_URL || bg === process.env.BACKGROUND_GREEN_URL) {
            return {
                status: 400,
                msg: 'No puedes eliminar esta imagen'
            }
        }

        await deleteImage(bg);

        const settingsFinded = await models.setting.findById(settingId);

        const settings = await models.setting.findOneAndUpdate({ _id: settingId, user: authId }, {
            background: {
                backgroundSelected: bgDefault,
                backgrounds: settingsFinded?.background.backgrounds?.filter(background => background !== bg)
            }
        }, { new: true });

        return {
            status: 200,
            settings
        }
    }
    catch (error) {
        console.log(error);

        return serverErrorSocket();
    }
}

export const removePhoto = async (userId: string, authId: string) => {
    try {
        const user = await models.user.findById(userId);

        if (!user) {
            return {
                status: 404,
                msg: 'Usuario no encontrado'
            }
        }

        if (!user._id.equals(authId)) {
            return {
                status: 401,
                msg: 'No tienes permisos para realizar esta acción'
            }
        }

        if (user.image) await deleteImage(user.image);

        await models.user.findByIdAndUpdate(userId, { image: null });

        return {
            status: 200
        }
    }
    catch (error) {
        console.log(error);

        return serverErrorSocket();
    }
}

export const blockedUser = async (authId: string, userId: string) => {
    const user = await models.user.findById(userId);

    if (!user || user.status === 0) {
        return { status: 404, msg: 'Usuario no encontrado' };
    }

    const auth = await models.user.findByIdAndUpdate(authId, {
        $push: { blockedUsers: userId } }, { new: true }
    );

    return {
        status: 200,
        msg: 'Usuario bloqueado',
        blockedUsers: auth?.blockedUsers || []
    }
}

export const unblockedUser = async (authId: string, userId: string) => {
    const auth = await models.user.findByIdAndUpdate(authId, {
        $pull: { blockedUsers: userId } }, { new: true }
    );

    return {
        status: 200,
        msg: 'Usuario desbloqueado',
        blockedUsers: auth?.blockedUsers || []
    }
}

export const destroy = async (req: Request, res: Response) => {
    try {
        const user = global.user;
        if (user?.image) await deleteImage(user.image);

        await models.user.findByIdAndUpdate(user?._id, { status: 0, image: '' });
        global.user = {} as UserDocument;

        return sendRes(res, 'Has borrado tu cuenta satisfactoriamente', 200);
    }
    catch (error) {
        return serverError(res, error);
    }
}