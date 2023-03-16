const mongoose = require('mongoose');

const environmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    app: { type: mongoose.Schema.Types.ObjectId, ref: 'App', required: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
    createdBy: { type: String, required: true },
    updatedBy: { type: String }
}, { timestamps: true });

// on save, check each feature flag for the given app and add the environment if it doesn't exist
environmentSchema.post('save', async function (doc, next) {
    try {
        const FeatureFlag = require('./FeatureFlagModel');
        const Environment = require('./EnvironmentModel');
        const featureFlags = await FeatureFlag.find({ app: doc.app });
        for (let i = 0; i < featureFlags.length; i++) {
            const featureFlag = featureFlags[i];
            const environments = featureFlag.environments;
            const environment = environments.find((env) => env.environment.toString() === doc._id.toString());
            if (!environment) {
                // create environment based on production
                const prod = await Environment.findOne({ name: 'Production', app: doc.app }).exec();
                if (!prod) {
                    next();
                }
                const prodFlag = environments.find((env) => env.environment.toString() === prod._id.toString());

                environments.push({
                    environment: doc._id,
                    isActive: prodFlag.isActive,
                    evaluationStrategy: prodFlag.evaluationStrategy,
                    evaluationPercentage: prodFlag.evaluationPercentage,
                    allowedUsers: prodFlag.allowedUsers,
                    disallowedUsers: prodFlag.disallowedUsers
                });
                featureFlags[i].environments = environments;
                await featureFlags[i].save();
            }
        }
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('Environment', environmentSchema);