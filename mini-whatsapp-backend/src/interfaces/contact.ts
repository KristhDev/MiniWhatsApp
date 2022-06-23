import { Types, Document } from 'mongoose';

export interface Contact {
    user: Types.ObjectId;
    contact: Types.ObjectId;
    name: string;
    chat: Types.ObjectId;
    status: number;
}

export interface ContactDocument extends Contact, Document {}