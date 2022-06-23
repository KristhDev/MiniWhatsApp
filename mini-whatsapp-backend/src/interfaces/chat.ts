import { Types, Document } from 'mongoose';
import { Notification } from '../interfaces/notification';

export interface Chat {
    name?: string;
    description?: string;
    createdBy?: Types.ObjectId;
    admins?: Types.ObjectId[];
    users: Types.ObjectId[];
    messages: Message[];
    notifications: Notification[];
    isGroup: boolean;
    image?: string;
    removedFor: Types.ObjectId[];
    status: number;
}

export interface Message {
    user: Types.ObjectId;
    chat: Types.ObjectId;
    responseTo?: Types.ObjectId;
    isResending: boolean;
    content?: string;
    src?: {
        image?: string;
        gif?: string;
    };
    removedFor: Types.ObjectId[];
}

export interface MessageData {
    user: string;
    chat: string;
    responseTo?: string;
    content: string;
    removedFor: string[];
}

export interface ChatDocument extends Chat, Document {}

export interface MessageDocument extends Message, Document {}