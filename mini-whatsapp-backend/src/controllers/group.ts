import cloudinary from 'cloudinary';
import { Types } from 'mongoose';

import { groupExists } from '../validations/database';
import { isAdminForGroup, isCreatorForGroup, userExistsInGroup } from '../validations/chat';

import models from '../models';

import { GroupData, NewGroup } from '../interfaces/group';

import { deleteImage } from '../utils/delete-image';
import { serverErrorSocket } from '../utils/server-error';

export const createGroup = async ({ name, usersIds, authId, image }: GroupData) => {
    try {
        const newGroup: NewGroup = {
            name,
            createdBy: authId,
            admins: [ authId ],
            users: [ ...usersIds, authId ],
            isGroup: true
        }

        if (image) {
            const buffer64 = 'data:image/jpeg;base64,' + Buffer.from(image).toString('base64');

            const { secure_url } = await cloudinary.v2.uploader.upload(buffer64, {
                folder: process.env.CLOUDINARY_FOLDER_GROUPS
            });

            newGroup.image = secure_url;
        }

        const group = new models.chat(newGroup);
        await group.save();

        const users = await models.user.find({ _id: { $in: usersIds } });

        return {
            status: 200,
            group,
            users
        }
    }
    catch (error) {
        console.log(error);

        return serverErrorSocket();
    }
}

export const updateGroup = async (groupId: string, data: { name?: string, description?: string }, authId: string, image?: any) => {
    try {
        const groupNotExists = await groupExists({ _id: groupId });
        if (groupNotExists) return groupNotExists;

        const isntAdmin = await isAdminForGroup(groupId, authId);
        if (isntAdmin) return isntAdmin;

        const group = await models.chat.findById(groupId);

        let imageGroup = group?.image || '';

        if (image) {
            if (imageGroup) await deleteImage(imageGroup);

            const buffer64 = 'data:image/jpeg;base64,' + Buffer.from(image).toString('base64');

            const { secure_url } = await cloudinary.v2.uploader.upload(buffer64, {
                folder: process.env.CLOUDINARY_FOLDER_GROUPS
            });

            imageGroup = secure_url;
        }

        await models.chat?.findByIdAndUpdate(groupId, { ...data, image: imageGroup });

        return {
            status: 200,
            imageGroup
        }
    }
    catch (error) {
        console.log(error);

        return serverErrorSocket();
    }
}

export const addUserOfGroup = async (groupId: string, usersIds: string[], authId: string) => {
    try {
        const groupNotExists = await groupExists({ _id: groupId });
        if (groupNotExists) return groupNotExists;

        const isntAdmin = await isAdminForGroup(groupId, authId.toString());
        if (isntAdmin) return isntAdmin;

        const usersExistsPromise = usersIds.map(uId => {
            return userExistsInGroup(groupId, uId, false)
        });

        const userExists = (await Promise.all(usersExistsPromise)).filter(u => u);

        if (userExists.length > 0) {
            return {
                status: 400,
                msg: 'Uno de los usuarios ya esta en el grupo'
            }
        }

        const group = await models.chat?.findOneAndUpdate({ _id: groupId }, {
            $addToSet: { users: usersIds },
            $pullAll: { removedFor: usersIds }
        }).populate('users');

        const users = await models.user?.find({ _id: { $in: usersIds } }).populate('settings');

        return {
            status: 200,
            users,
            destinations: group?.users.map(u => (u as any)?.phone)
        }
    }
    catch (error) {
        console.log(error);

        return serverErrorSocket();
    }
}

export const removeUserOfGroup = async (groupId: string, userId: string, authId: Types.ObjectId) => {
    try {
        const groupNotExists = await groupExists({ _id: groupId });
        if (groupNotExists) return groupNotExists;

        const userNotExistsInGroup = await userExistsInGroup(groupId, userId);
        if (userNotExistsInGroup) return userNotExistsInGroup;

        const isntAdmin = await isAdminForGroup(groupId, authId.toString());

        if (!isntAdmin || authId.equals(userId)) {
            await models.chat?.findOneAndUpdate({ _id: groupId }, {
                $addToSet: { removedFor: userId },
                $pull: { admins: userId }
            });

            return {
                status: 200
            }
        }

        return isntAdmin;
    }
    catch (error) {
        console.log(error);

        return serverErrorSocket();
    }
}

export const addAdminOfGroup = async (groupId: string, userId: string, authId: string) => {
    try {
        const groupNotExists = await groupExists({ _id: groupId });
        if (groupNotExists) return groupNotExists;

        const userNotExistsInGroup = await userExistsInGroup(groupId, userId);
        if (userNotExistsInGroup) return userNotExistsInGroup;

        const instCreator = await isCreatorForGroup(groupId, authId);
        if (instCreator) return instCreator;

        await models.chat?.findOneAndUpdate({ _id: groupId }, { $addToSet: { admins: userId } });

        return {
            status: 200
        }
    }
    catch (error) {
        console.log(error);

        return serverErrorSocket();
    }
}

export const removeAdminOfGroup = async (groupId: string, userId: string, authId: string) => {
    try {
        const groupNotExists = await groupExists({ _id: groupId });
        if (groupNotExists) return groupNotExists;

        const userNotExistsInGroup = await userExistsInGroup(groupId, userId);
        if (userNotExistsInGroup) return userNotExistsInGroup;

        const instCreator = await isCreatorForGroup(groupId, authId);
        if (instCreator) return instCreator;

        await models.chat?.findOneAndUpdate({ _id: groupId }, { $pull: { admins: userId } });

        return {
            status: 200
        }
    }
    catch (error) {
        console.log(error);

        return serverErrorSocket();
    }
}

export const assignCreatorToGroup = async (groupId: string, userId: string, authId: string) => {
    try {
        const groupNotExists = await groupExists({ _id: groupId });
        if (groupNotExists) return groupNotExists;

        const userNotExistsInGroup = await userExistsInGroup(groupId, userId);
        if (userNotExistsInGroup) return userNotExistsInGroup;

        const instCreator = await isCreatorForGroup(groupId, authId);
        if (instCreator) return instCreator;

        await models.chat?.findOneAndUpdate({ _id: groupId }, {
            createdBy: userId,
            $addToSet: { admins: userId }
        });

        return {
            status: 200
        }
    }
    catch (error) {
        console.log(error);

        return serverErrorSocket();
    }
}

export const removePhotoOfGroup = async (groupId: string, authId: string) => {
    try {
        const groupNotExists = await groupExists({ _id: groupId });
        if (groupNotExists) return groupNotExists;

        const isntAdmin = await isAdminForGroup(groupId, authId);
        if (isntAdmin) return isntAdmin;

        const group = await models.chat?.findById(groupId);
        if (group?.image) await deleteImage(group.image);

        await models.chat?.findByIdAndUpdate(groupId, { image: null });

        return {
            status: 200
        }
    }
    catch (error) {
        console.log(error);

        return serverErrorSocket();
    }
}