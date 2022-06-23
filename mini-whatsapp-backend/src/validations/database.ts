import models from '../models';

import { UserFilter, ContactFilter, ModelsDocuments, Collection, ChatFilter } from '../interfaces/models';

export const userExists = async (query: UserFilter, notExists: boolean = false) => {
    const user = await models.user.findOne(query);

    return docExists(user, 'user', notExists);
}

export const contactExists = async (query: ContactFilter, notExists: boolean = false) => {
    const contact = await models.contact.findOne(query);

    return docExists(contact, 'contact', notExists);
}

export const groupExists = async (query: ChatFilter) => {
    const group = await models.chat.findOne(query);

    if (!group) {
        return {
            status: 404,
            msg: 'El grupo no existe'
        }
    }
}

const docExists = (doc: ModelsDocuments, collection: Collection, notExists: boolean = false) => {
    if (doc?.status === 0) throw new Error(`Este ${ collection } fue eliminado`);
    if (!doc && !notExists) throw new Error(`Este ${ collection } no existe`);
    if (doc && notExists) throw new Error(`Este ${ collection } ya existe`);

    return true;
}