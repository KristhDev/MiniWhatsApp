import { Document, Types } from 'mongoose';

export interface Setting {
    user: Types.ObjectId;
    background: {
        backgroundSelected: string;
        backgrounds: string[];
    },
    privacy: {
        lastConnection: string;
        profilePhoto: string;
        info: string;
        groups: string;
    }
}

export interface SettingDocument extends Setting, Document {}