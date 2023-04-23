import { Schema, Model, model } from 'mongoose';
import { IFeatureFlag } from '../interfaces/IFeatureFlag';
import { createAuditLog } from '../middleware/auditLogMiddleware';

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

featureFlagSchema.post('findOneAndUpdate', async function (updatedDoc, next) {
  try {
    const originalDoc = await this.model.findOne(this.getFilter()).exec();
    await createAuditLog(originalDoc, updatedDoc, 'update', updatedDoc.get('updatedBy'));
    next();
  } catch (err) {
    console.error(err)
    next();
  }
});

featureFlagSchema.pre('save', async function (next) {
  if (this.isModified()) {
    try {
      const model = this.constructor as Model<IFeatureFlag>;
      const originalDoc = await model.findById(this._id).exec();
      if (originalDoc) {
        await createAuditLog(originalDoc, this, 'update', this.get('updatedBy'));
      } else {
        await createAuditLog(null, this, 'create', this.get('createdBy'));
      }
      next();
    } catch (err) {
      console.error(err)
      next();
    }
  } else {
    next();
  }
});


const FeatureFlag: Model<IFeatureFlag> = model<IFeatureFlag>('FeatureFlag', featureFlagSchema);

export default FeatureFlag;
