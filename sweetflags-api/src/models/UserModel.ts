import mongoose, { Schema } from 'mongoose';
import { IUser } from '../interfaces/IUser';

const userSchema: Schema = new Schema({
    externalId: { type: String, required: true, unique: true },
    name: { type: String },
    app: { type: Schema.Types.ObjectId, ref: 'App', required: true },
    metadata: { type: Object },
    isActive: { type: Boolean, required: true },
    createdBy: { type: String, required: true },
    updatedBy: { type: String },
}, {
    timestamps: true,
    toObject: {
        transform: function (_doc, ret) {
            if (ret._id) {
                ret.id = ret._id.toString();
                delete ret._id;
            }
            delete ret.__v;
        }
    }
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;
