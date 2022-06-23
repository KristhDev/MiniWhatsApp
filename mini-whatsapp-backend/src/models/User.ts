import { Schema, model, Types } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { UserDocument } from '../interfaces/user';

const UserSchema = new Schema<UserDocument>({
    name: {
        type: String,
        required: [ true, 'El nombre es requerido' ]
    },
    surname: {
        type: String,
        required: [ true, 'El apellido es requerido' ]
    },
    username: {
        type: String,
        required: [ true, 'El nombre de usuario es requerido' ]
    },
    phone: {
        type: String,
        required: [ true, 'El número de teléfono es requerido'],
        unique: true
    },
    description: String,
    image: String,
    password: {
        type: String,
        required: [ true, 'La contraseña es requerida' ]
    },
    blockedUsers: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    settings: {
        type: Schema.Types.ObjectId,
        ref: 'Setting'
    },
    lastConnection: {
        type: Date,
        required: true,
        default: Date.now
    },
    status: {
        type: Number,
        default: 1
    },
    online: {
        type: Boolean,
        default: false
    }
},
{
    timestamps: true
});

UserSchema.pre<UserDocument>('save', function(next) {
    const user = this;
    if (!user.isModified('password')) return next();

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(user.password, salt);
    user.password = hash;

    next();
});

UserSchema.methods.comparePassword = function(password: string) {
    return bcrypt.compareSync(password, this.password);
}

UserSchema.methods.generateJWT = (id: string) => {
    return new Promise((resolve, reject) => {
        const payload = { id };
        const secretKey = process.env.SECRET_PRIVATE_KEY || '';

        jwt.sign(payload, secretKey, { expiresIn: '12h' }, (err, token) => {
            if (err) {
                console.log(err);
                reject('The token could not be generated');
            }
            else {
                resolve(token);
            }
        })
    });
}

UserSchema.methods.isBlocked = function(userId: string) {
    return !!this.blockedUsers.find((id: Types.ObjectId) => id.equals(userId));
}

UserSchema.methods.setOnline = async function () {
    await model('User', UserSchema).findByIdAndUpdate(this._id, { online: true });
    this.online = true;
}

UserSchema.methods.setOffline = async function () {
    const date = new Date();
    await model('User', UserSchema).findByIdAndUpdate(this._id, { online: false, lastConnection: date });

    this.online = false;
    this.lastConnection = date;
}

UserSchema.methods.toJSON = function() {
    const { __v, _id, password, ...user } = this.toObject();
    user.id = _id;

    return user;
}

const User = model<UserDocument>('User', UserSchema);

export default User;