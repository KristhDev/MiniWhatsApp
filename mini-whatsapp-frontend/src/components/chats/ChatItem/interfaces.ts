import { Contact } from '../../../interfaces/auth';

export interface ChatItemProps {
    active: boolean;
    contact: Contact;
    createdBy: string;
    descriptionGroup: string;
    isGroup: boolean;
    lastMessage: {
        content: string;
        date?: Date;
        src?: {
            image?: string;
            gif?: string;
        }
    },
    totalNotifications: number;
}