import mongoose, { Schema } from 'mongoose';
import { IEnvironment } from '../interfaces/IEnvironment';
import FeatureFlag from './FeatureFlagModel';
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
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
}
);

// on save, check each feature flag for the given app and add the environment if it doesn't exist
environmentSchema.post<IEnvironment>('save', async function (doc, next) {
    try {
        const featureFlags = await FeatureFlag.find({ app: doc.app });
        for (let i = 0; i < featureFlags.length; i++) {
            // for each feature flag, check if the new environment exists, and if not, create it and set its state to the same as the production environment
            const featureFlag = featureFlags[i];
            const environments = featureFlag.environments;
            const environment = environments.find((env) => env.environment.toString() === doc.id.toString());
            if (!environment) {
                const prod = await Environment.findOne({ name: 'Production', app: doc.app }).exec();
                if (!prod) {
                    next();
                }
                const prodFlag = environments.find((env) => env.environment.toString() === prod!._id.toString());

                environments.push({
                    environment: doc,
                    isActive: prodFlag!.isActive,
                    evaluationStrategy: prodFlag!.evaluationStrategy,
                    evaluationPercentage: prodFlag!.evaluationPercentage,
                    allowedUsers: prodFlag!.allowedUsers,
                    disallowedUsers: prodFlag!.disallowedUsers
                });
                featureFlags[i].environments = environments;
                await featureFlags[i].save();
            }
        }
        next();
    } catch (err: unknown) {
        console.error(err);
        next(err as Error);
    }
});

export default mongoose.model<IEnvironment>('Environment', environmentSchema);
