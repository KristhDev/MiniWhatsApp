import { Schema, model } from 'mongoose';

import { ChatDocument } from '../interfaces/chat';
import { MessageSchema } from './Message';
import { NotificationSchema } from './Notification';

const ChatSchema = new Schema<ChatDocument>({
    name: String,
    description: String,
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    admins: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    users: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [ true, 'El usuario es requerido' ]
    }],
    messages: [ MessageSchema ],
    notifications: [ NotificationSchema ],
    image: String,
    isGroup: {
        type: Boolean,
        default: false
    },
    removedFor: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    status: {
        type: Number,
        enum: [ 0, 1 ],
        default: 1
    }
}, {
    timestamps: true
});

ChatSchema.methods.toJSON = function() {
    const { __v, _id, ...chat } = this.toObject();
    chat.id = _id;

    return chat;
}

const Chat = model<ChatDocument>('Chat', ChatSchema);

export default Chat;