import mongoose, { Schema } from 'mongoose';
import { IApp } from '../interfaces/IApp';

const appSchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    isActive: { type: Boolean, required: true },
    createdBy: { type: String, required: true }
}, {
    timestamps: true,
    toObject: {
        transform: function (_doc, ret) {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
        }
    }
}
);

export default mongoose.model<IApp>('App', appSchema);
