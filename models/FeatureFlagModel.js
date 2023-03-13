const mongoose = require('mongoose');

const evaluationStrategyEnum = {
    values: ['IMMEDIATE', 'USER', 'PERCENTAGE'],
    message: '{VALUE} is not a valid EvaluationStrategy value'
};

const featureFlagSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  app: { type: mongoose.Schema.Types.ObjectId, ref: 'App', required: true },
  environments: [
    {
        environment: { type: mongoose.Schema.Types.ObjectId, ref: 'Environment', required: true },
        isActive: { type: Boolean, default: false },
        evaluationStrategy: { type: String, enum: evaluationStrategyEnum, required: true },
        evaluationPercentage: { type: Number },
        allowedUsers: { type: [String] },
        disallowedUsers: { type: [String] }
    }
  ],
  createdBy: { type: String, required: true },
  updatedBy: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('FeatureFlag', featureFlagSchema);
