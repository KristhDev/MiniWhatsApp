import { FilterQuery } from 'mongoose';
import { ChatDocument } from './chat';
import { ContactDocument } from './contact';
import { UserDocument } from './user';

export type Collection = | 'user' | 'contact';
export type Collections = | 'users' | 'contacts';

export type UserFilter = FilterQuery<UserDocument>;
export type ContactFilter = FilterQuery<ContactDocument>;
export type ChatFilter = FilterQuery<ChatDocument>;

export type ModelsDocuments = | UserDocument | ContactDocument | null;

export type Models = {
    user: UserDocument;
    contact: ContactDocument;
}