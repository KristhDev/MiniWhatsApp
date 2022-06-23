import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import models from '../models';
import global from '../enviroment/global';

import { sendRes } from '../utils/send-res';

export const validateJWT = async (req: Request, res: Response, next: NextFunction) => {
    const token = String(req.headers['x-token']) || '';
    const secretKey = process.env.SECRET_PRIVATE_KEY || '';

    if (!token) {
        return sendRes(res, 'Necesita estar autenticado para esta acción', 401);
    }

    try {
        const payload = jwt.verify(token, secretKey);
        const id: string = (payload as any).id;

        const user = await models.user.findOne({ _id: id }).populate('settings');

        if (!user) return sendRes(res, 'Este usuario no existe', 400);
        if (user?.status === 0) return sendRes(res, 'Lo sentimos, pero este usuario fue eliminado', 401);

        global.user = user;

        return next();
    }
    catch (error) {
        console.log(error);

        return sendRes(res, 'La autenticación no es valida o su tiempo de sesión termino', 400);
    }
}