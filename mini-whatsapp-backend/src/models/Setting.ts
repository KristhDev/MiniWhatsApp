import { Schema, model } from 'mongoose';

import { SettingDocument } from '../interfaces/setting';

const SettingSchema = new Schema<SettingDocument>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        unique: true
    },
    background: {
        backgroundSelected: {
            type: String,
            required: [ true, 'El fondo seleccionado es requiredo' ]
        },
        backgrounds: {
            type: [ String ],
            required: [ true, 'Los fondos son requeridos' ]
        }
    },
    privacy: {
        lastConnection: {
            type: String,
            enum: [ 'all', 'contacts', 'nobody' ],
            default: 'all'
        },
        profilePhoto: {
            type: String,
            enum: [ 'all', 'contacts', 'nobody' ],
            default: 'all'
        },
        info: {
            type: String,
            enum: [ 'all', 'contacts', 'nobody' ],
            default: 'all'
        },
        groups: {
            type: String,
            enum: [ 'all', 'contacts', 'nobody' ],
            default: 'all'
        }
    }
}, {
    timestamps: true
});

const Setting = model<SettingDocument>('Setting', SettingSchema);

export default Setting;