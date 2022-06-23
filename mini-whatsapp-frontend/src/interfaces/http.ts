import { Contact, User } from './auth';
import { Message, Notification } from './chat';

export interface UserUpdateResponse {
    user: User;
    msg: string;
    status: number;
}

export interface LoginResponse {
    user: User;
    contacts: Contact[];
    chats: ChatResponse[];
    token: string;
    status: number;
}

export interface ContactResponse {
    contact: Contact;
    chat: ChatResponse;
    status: number;
}

export interface ChatResponse {
    id: string;
    name?: string;
    description?: string;
    admins?: string[];
    createdBy?: string;
    removedFor: string[];
    users: string[];
    messages: Message[];
    image?: string;
    notifications: Notification[];
    isGroup: boolean;
    status: number;
    createdAt: Date;
}