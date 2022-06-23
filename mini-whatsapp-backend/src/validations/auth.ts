import { response } from 'express';
import { Query } from 'mongoose';
import jwt from 'jsonwebtoken'

import models from '../models';
import global from '../enviroment/global';

import { UserDocument } from '../interfaces/user';

import { serverError } from '../utils/server-error';

export const isMyAcount = async (id: string) => {
    const { user: userFetch } = global;

    try {
        const user = await models.user.findById(id);
        if (!user) throw new Error('Este usuario no existe');

        if (user?._id.equals(userFetch.id)) return true;

        throw new Error('No tienes permiso para realizar está acción');
    }
    catch (error) {
        return serverError(response, error);
    }
}

export const isMyContact = async (id: string) => {
    const { user } = global;

    try {
        const contact = await models.contact.findById(id).populate('contact');

        if (contact?.user.equals(user._id)) return true;

        throw new Error('No tienes permiso para realizar está acción');
    }
    catch (error) {
        return serverError(response, error);
    }
}

export const imBlockedBy = async (usersIds: string[], authId: string) => {
    try {
        let usersPromise: Query<UserDocument | null, UserDocument, {}, UserDocument>[] = [];

        usersIds.forEach(userId => {
            const userPromise = models.user.findOne({ _id: userId, blockedUsers: { $in: [ authId ] } });
            usersPromise = [ ...usersPromise, userPromise ];
        });

        const users = await Promise.all(usersPromise);

        if (users.some(user => user)) return true;
        else return false;
    }
    catch (error) {
        return false;
    }
}

export const checkJWT = async (token: string) => {
    const privateKey = process.env.SECRET_PRIVATE_KEY || '';

    if (token.length < 10) return null;

    try {
        const payload = jwt.verify(token, privateKey);
        const id: string = (payload as any).id;

        const user = await models.user.findOne({ _id: id });

        if (!user || user.status === 0) return null;

        return user;
    }
    catch (error) {
        console.log(error);

        return null;
    }
}