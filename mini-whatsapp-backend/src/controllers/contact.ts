import { Request, Response } from 'express';
import { body as checkBody, validationResult } from 'express-validator';

import models from '../models';
import global from '../enviroment/global';

import { UserDocument } from '../interfaces/user';

import { sendRes } from '../utils/send-res';
import { serverError } from '../utils/server-error';

export const create = async (req: Request, res: Response) => {
    const { body } = req;

    try {
        const user = await models.user.findOne({ phone: body.phone });

        if (user?._id.equals(global.user.id)) {
            return res.status(400).json({
                msg: 'No puedes crear un contacto con tu mismo número telefónico',
                status: 400
            })
        }

        const newContact = new models.contact({ name: body.name });
        newContact.user = global.user.id;
        newContact.contact = user?.id;

        const contact = await models.contact.findOne({ user: user?._id, contact: global.user.id });
        let chat = await models.chat.findById(contact?.chat);

        if (!chat) {
            chat = new models.chat({ users: [ global.user.id, user?.id ] });
            await chat.save();
        }

        newContact.chat = chat.id;
        await newContact.save();
        const contactStored = await models.contact.findOne({ _id: newContact._id })
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

        global.user = {} as UserDocument;

        return res.status(200).json({
            contact: contactStored,
            chat,
            status: 200
        });
    }
    catch (error) {
        return serverError(res, error)
    }
}

export const update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { id: docId, _id, contact, phone, createdAt, user, ...rest } = req.body;

    try {
        if (phone) {
            checkBody('phone').isMobilePhone('any');
            const error = validationResult(req).formatWith(({ msg }) => msg);

            if (!error.isEmpty()) return sendRes(res, error.array()[0], 400);

            const userContact = await models.user.findOne({ phone });

            if (!userContact) return sendRes(res, 'No existe un usuario con ese número telefónico', 400);
            if (userContact.status === 0) return sendRes(res, 'Lo sentimos, pero este usuario fue eliminado', 400);

            rest.contact = userContact._id;
        }

        global.user = {} as UserDocument;

        await models.contact.findByIdAndUpdate(id, rest);

        const contactUpdated = await models.contact.findById(id)
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

        return res.status(200).json({
            contact: contactUpdated,
            status: 200,
            msg: 'Contacto actualizado correctamente'
        });
    }
    catch (error) {
        return serverError(res, error);

    }
}

export const destroy = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const contact = await models.contact.findById(id).populate('contact');
        await models.contact.findByIdAndUpdate(id, { name: (contact?.contact as any)?.phone || 0 });
        const contactDeleted = await models.contact.findById(id)
            .populate('contact', ['_id', 'username', 'phone', 'image', 'description', 'blockedUsers', 'lastConnection', 'online', 'settings']);

        return res.status(200).json({
            contact: contactDeleted,
            status: 200
        });
    }
    catch (error) {
        return serverError(res, error);
    }
}