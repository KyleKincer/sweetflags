import mongoose, { Schema, Document } from 'mongoose';

export interface IApp extends Document {
    name: string;
    description?: string;
    isActive: boolean;
    createdBy: string;
}

const appSchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    isActive: { type: Boolean, required: true },
    createdBy: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model<IApp>('App', appSchema);
