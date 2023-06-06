import mongoose, { Schema } from 'mongoose';
import { IEnvironment } from '../interfaces/IEnvironment';
import FeatureFlag from './ConfigModel';
import Environment from './EnvironmentModel';

const environmentSchema: Schema = new mongoose.Schema({
    name: { type: String, required: true },
    app: { type: mongoose.Schema.Types.ObjectId, ref: 'App', required: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
    createdBy: { type: String, required: true },
    updatedBy: { type: String }
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

export default mongoose.model<IEnvironment>('Environment', environmentSchema);
