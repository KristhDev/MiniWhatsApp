import { Document, Types } from 'mongoose';

export interface Notification {
    chat: Types.ObjectId;
    readBy: Types.ObjectId[];
}

export interface NotificationDocument extends Notification, Document {};