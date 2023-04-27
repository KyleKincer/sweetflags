import { Schema, Model, model } from 'mongoose';
import { IFeatureFlag } from '../interfaces/IFeatureFlag';
import { IEnvironment } from './EnvironmentModel';
import { IApp } from './AppModel';

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
      allowedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      disallowedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      updatedBy: { type: String }
    }
  ],
  createdBy: { type: String, required: true },
  updatedBy: { type: String },
}, {
  timestamps: true,
  toObject: {
    transform: function (_doc, ret) {
      ret.id = ret._id.toString();
      ret.environments = ret.environments.map((env) => {
        env.id = env._id.toString();
        delete env._id;
        return env;
      });
      delete ret._id;
      delete ret.__v;
    }
  }
}
);

const FeatureFlag: Model<IFeatureFlag> = model<IFeatureFlag>('FeatureFlag', featureFlagSchema);

export default FeatureFlag;
