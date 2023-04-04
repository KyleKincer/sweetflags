import { Schema, Model, model } from 'mongoose';
import { IFeatureFlag } from '../interfaces/IFeatureFlag';

const evaluationStrategyEnum = {
  values: ['BOOLEAN', 'USER', 'PERCENTAGE', 'PROBABALISTIC'],
  message: '{VALUE} is not a valid EvaluationStrategy value'
};

const featureFlagSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  app: { type: Schema.Types.ObjectId, ref: 'App', required: true },
  environments: [
    {
      environment: { type: Schema.Types.ObjectId, ref: 'Environment', required: true },
      isActive: { type: Boolean, default: false },
      evaluationStrategy: { type: String, enum: evaluationStrategyEnum, required: true },
      evaluationPercentage: { type: Number },
      allowedUsers: { type: [String] },
      disallowedUsers: { type: [String] }
    }
  ],
  createdBy: { type: String, required: true },
  updatedBy: { type: String },
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

const FeatureFlag: Model<IFeatureFlag> = model<IFeatureFlag>('FeatureFlag', featureFlagSchema);

export default FeatureFlag;
