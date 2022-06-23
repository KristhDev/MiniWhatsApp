import { User } from './auth';
import { Message, Notification } from './chat';

export interface UserOnline {
    userId: string;
    online: boolean;
    lastConnection: Date;
}

export interface SetChat {
    chatId: string,
    messages: Message[],
    notifications: Notification[]
}

export interface UpdatingContact {
    name: string;
    phone: string;
    id: string;
}

export interface ChatSelected {
    id: string;
    name: string;
    destinations: string[];
    description: string;
    isGroup: boolean;
    users: User[];
}