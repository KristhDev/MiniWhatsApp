import { Socket } from 'socket.io-client';

import { Contact, Settings, User } from './auth';
import { Message, MessageFile, Notification } from './chat';
import { ChatResponse } from './http';

export interface SocketState {
    socket: Socket
}

export interface SendChatWithLastMessagePayload {
    chat: ChatResponse;
    status: number;
    msg?: string;
}

export interface NewGroupPayload {
    destinations: string[];
    group: ChatResponse;
    status: number;
    users: User[];
    msg?: string;
}

export interface EditedGroupPayload {
    chatId: string;
    data: {
        name: string;
        description: string;
    }
    status: number;
    imageGroup?: string;
    msg?: string;
}

export interface RemovedUserGroupPayload {
    userId: string;
    chatId: string;
    status: number;
    msg?: string;
}

export interface GetChatPayload {
    chat: ChatResponse;
    users: User[]
    usersPhones: string[];
    files?: MessageFile[];
}

export interface CleanChatForMePayload {
    resp: {
        chat: ChatResponse;
        status: number;
        msg?: string;
    }
}

export interface RecivedMessagePayload {
    status: number;
    message: Message,
    msg?: string;
}

export interface SendRensendMessagesPayload {
    status: number;
    data: {
        chatId: string;
        messages: Message[];
        notifications: Notification[];
    }[];
    msg?: string;
}

export interface SendMoreMessagesPayload {
    status: number;
    messages?: Message[];
    msg?: string;
}

export interface SendNewContactPayload {
    contact: Contact;
    chat: ChatResponse;
}

export interface DeletedMessagesPayload {
    messagesIds: string[];
    status: number;
    msg?: string;
}

export interface DeletedChatPayload  {
    status: number;
    chatId?: string;
    msg?: string;
}

export interface BlockedUserPayload {
    blockedUsers: string[];
    msg: string;
    status: number;
}

export interface ContactUsersBlockedPayload {
    blockedUsers: string[];
    userId: string;
}

export interface OnlineUserPayload {
    lastConnection: Date
    online: boolean;
    userId: string;
}

export interface ReadNotificationsPayload {
    status: number;
    msg?: string;
}

export interface AddedParticipantToGroupPayload {
    groupId?: string;
    msg?: string;
    status: number;
    users?: User[];
}

export interface AppointedAsAdminPayload {
    groupId?: string;
    msg?: string;
    newAdmin?: string;
    status: number;
}

export interface RemovedAdminGroupPayload {
    groupId?: string;
    msg?: string;
    removedAdmin?: string;
    status: number;
}

export interface AssignedCreatorToGroupPayload {
    groupId?: string;
    msg?: string;
    newCreator?: string;
    status: number;
}

export interface RemoveUserPhotoPayload {
    status: number;
    msg?: string;
}

export interface RemovedGroupPhotoPayload {
    status: number;
    msg?: string;
    groupId?: string;
}

export interface UpdatedUserSettingsPayload {
    status: number;
    msg?: string;
    userId?: string;
    settings: Settings;
}