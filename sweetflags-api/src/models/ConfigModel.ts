import { Schema, Model, model } from 'mongoose';
import { IConfig } from '../interfaces/IConfig';

const evaluationStrategyEnum = {
  values: ['BOOLEAN', 'USER', 'PERCENTAGE', 'PROBABALISTIC'],
  message: '{VALUE} is not a valid EvaluationStrategy value'
};

const typeEnum = {
  values: ['BOOLEAN', 'JSON', 'TEXT', 'ENUM'],
  message: '{VALUE} is not a valid Type value'
};

const configSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  app: { type: Schema.Types.ObjectId, ref: 'App', required: true },
  environments: [
    {
      environment: { type: Schema.Types.ObjectId, ref: 'Environment', required: true },
      type: { type: String, enum: typeEnum, required: true },
      value: { type: Schema.Types.Mixed },
      evaluationStrategy: { type: String, enum: evaluationStrategyEnum },
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
      if (ret.environments.length > 0) {
        ret.environments = ret.environments.map((env) => {
          if (env._id) {
            env.id = env._id.toString();
            delete env._id;
          }
          return env;
        });
      }
      delete ret._id;
      delete ret.__v;
    }
  }
}
);

const Config: Model<IConfig> = model<IConfig>('Config', configSchema);

export default Config;
