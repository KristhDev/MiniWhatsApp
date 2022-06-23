import { NextFunction, Request, Response } from 'express';

import models from '../models';
import global from '../enviroment/global';

export const newContact = async (req: Request, res: Response, next: NextFunction) => {
    const { body } = req;

    const user = await models.user.findOne({ phone: body.phone });
    const contact = await models.contact.findOne({ user: global.user._id, contact: user?.id });

    if (contact?.status === 0 || !contact) return next();

    return res.status(400).json({
        msg: 'Este número ya existe en uno de tus contactos',
        status: 400
    });
}