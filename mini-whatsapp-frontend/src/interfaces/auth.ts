import { ChatResponse } from './http';

export interface AuthState {
    user: User;
    contacts: Contact[];
    selectedContacts: string[];
    chats: ChatResponse[];
    isAuthLoading: boolean;
    privacyText: string;
}

export interface User {
    id?: string;
    name?: string;
    surname?: string;
    username?: string;
    phone?: string;
    description?: string;
    image?: string;
    blockedUsers?: string[];
    lastConnection?: Date;
    settings?: Settings;
    online?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Settings {
    _id: string;
    user: string;
    background: {
        backgroundSelected: string;
        backgrounds: string[];
    },
    privacy: {
        lastConnection: PrivacyOption;
        profilePhoto: PrivacyOption;
        info: PrivacyOption;
        groups: PrivacyOption;
    }
}

export type PrivacyOption = 'all' | 'contacts' | 'nobody';

export interface Contact {
    id?: string;
    name?: string;
    user?: string;
    chat?: string;
    contact?: {
        _id?: string;
        username?: string;
        phone?: string;
        image?: string;
        description?: string;
        blockedUsers?: string[];
        lastConnection?: Date;
        online?: boolean;
        settings?: Settings;
    }
    createdAt?: Date;
    updatedAt?: Date;
}

export type UserLoginPayload = {
    contacts: Contact[];
    chats: ChatResponse[];
    user: User;
}

export type AddContactPayload = { 
    contact: Contact 
}

export type UpdatedContactPayload = { 
    contact: Contact 
}

export type SetChatPayload = { 
    chat: ChatResponse 
}

export type UpdateChatPayload = { 
    chatId: string, 
    data: { 
        name: string, 
        description: string 
    } 
}

export type SetImageGroupToChatPayload = {
    chatId: string,
    image: string
}

export type RemovedChatPayload = { 
    chatId: string 
}
export type RemovedUserOfMyChatsPayload = { 
    userId: string, 
    chatId: string 
}

export type RemovedChatNotificationsPayload = {
    chatId: string 
}

export type SetBlockedUserPayload = { 
    blockedUsers: string[]
}

export type AddContactBlockedUserPayload = { 
    blockedUsers: string[], 
    userId: string 
}

export type SetOnlineContactUserPayload = { 
    userId: string, online: boolean, 
    lastConnection: Date 
}

export type UpdateUserSettingsPayload = {
    settings: Settings
}

export type UpdateSettingOfContactPayload = {
    settings: Settings
}

export type SetSelectedContactsPayload = { 
    contactId: string 
}

export type ReplaceCreatorOfMyChatsPayload = {
    chatId: string,
    creatorId: string
}

export type RemoveGroupPhotoPayload = {
    chatId: string
}

export type SetPrivacyTextPayload = {
    text: string
}