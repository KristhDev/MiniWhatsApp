import { model, Schema } from 'mongoose';

import { NotificationDocument } from '../interfaces/notification';

export const NotificationSchema = new Schema<NotificationDocument>({
    chat: {
        type: Schema.Types.ObjectId,
        ref: 'Chat',
        required: [ true, 'Chat es requerido' ],
    },
    readBy: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
});

NotificationSchema.methods.toJSON = function() {
    const { __v, ...notification } = this.toObject();

    return notification;
}

const Notification = model<NotificationDocument>('Notification', NotificationSchema);

export default Notification;