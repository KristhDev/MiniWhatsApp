import models from '../models';

export const isAdminForGroup = async (groupId: string, authId: string) => {
    const group = await models.chat.findOne({ _id: groupId, admins: { $in: [ authId ] } });

    if (!group) {
        return {
            status: 403,
            msg: 'No tienes permisos para realizar está acción'
        }
    }
}

export const isCreatorForGroup = async (groupId: string, authId: string) => {
    const group = await models.chat.findOne({ _id: groupId, createdBy: authId });

    if (!group) {
        return {
            status: 403,
            msg: 'No tienes permisos para realizar está acción'
        }
    }
}

export const userExistsInGroup = async (groupId: string, userId: string, exists: boolean = true) => {
    const group = await models.chat.findOne({ _id: groupId, users: { $in: [ userId ] } });

    if (!group && exists) {
        return {
            status: 404,
            msg: (exists) ? 'El usuario no existe en el grupo' : 'El usuario ya existe en el grupo'
        }
    }
}