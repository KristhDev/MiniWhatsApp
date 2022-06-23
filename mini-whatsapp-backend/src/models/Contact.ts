import { Schema, model } from 'mongoose';

import { ContactDocument } from '../interfaces/contact';

const ContactSchema = new Schema<ContactDocument>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [ true, 'El usuario es requerido' ]
    },
    contact: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [ true, 'El contacto es requerido' ]
    },
    chat: {
        type: Schema.Types.ObjectId,
        ref: 'Chat',
        required: [ true, 'El chat es requerido' ]
    },
    name: {
        type: String,
        required: [ true, 'El nombre es requerido' ]
    },
    status: {
        type: Number,
        enum: [ 0, 1 ],
        default: 1
    }
},
{
    timestamps: true
});

ContactSchema.methods.toJSON = function() {
    const { __v, _id, ...contact } = this.toObject();
    contact.id = _id;

    return contact;
}

const Contact = model<ContactDocument>('Contact', ContactSchema);

export default Contact;