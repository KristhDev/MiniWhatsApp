import { Document, Types } from 'mongoose';

export interface User {
    name: string;
    surname: string;
    username: string;
    phone: string;
    description?: string;
    image?: string;
    password: string;
    lastConnection?: Date;
    settings?: Types.ObjectId;
    blockedUsers: Types.ObjectId[];
    status: number;
    online: boolean;
}

export interface UserDocument extends User, Document {
    comparePassword: (password: string) => void,
    generateJWT: (id: string) => Promise<string>,
    isBlocked: (userId: string) => boolean,
    setOnline: () => Promise<void>,
    setOffline: () => Promise<void>,
}