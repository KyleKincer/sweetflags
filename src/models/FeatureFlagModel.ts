import { Document, Schema, Model, model } from 'mongoose';
import { IEnvironment } from './EnvironmentModel';
import { IApp } from './AppModel';

const evaluationStrategyEnum = {
    values: ['BOOLEAN', 'USER', 'PERCENTAGE', 'PROBABALISTIC'],
    message: '{VALUE} is not a valid EvaluationStrategy value'
};

export interface IFeatureFlag extends Document {
  name: string;
  description?: string;
  app: IApp['_id'];
  environments: [
    {
        environment: IEnvironment['_id'];
        isActive: boolean;
        evaluationStrategy: string;
        evaluationPercentage?: number;
        allowedUsers?: string[];
        disallowedUsers?: string[];
    }
  ];
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

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
}, { timestamps: true });

const FeatureFlag: Model<IFeatureFlag> = model<IFeatureFlag>('FeatureFlag', featureFlagSchema);

export default FeatureFlag;
