import { Schema, model } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { MessageDocument } from '../interfaces/chat';

export const MessageSchema = new Schema<MessageDocument>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [ true, 'El usuario es requerido' ]
    },
    chat: {
        type: Schema.Types.ObjectId,
        ref: 'Chat',
        required: [ true, 'El chat es requerido' ]
    },
    responseTo: {
        type: Schema.Types.ObjectId,
        ref: 'Message',
    },
    isResending: {
        type: Boolean,
        default: false
    },
    content: String,
    src: {
        image: String,
        gif: String
    },
    removedFor: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

MessageSchema.plugin(mongoosePagination);

MessageSchema.methods.toJSON = function() {
    const { __v, ...message } = this.toObject();

    return message;
}

const Message = model<MessageDocument, Pagination<MessageDocument>>('Message', MessageSchema);

export default Message;