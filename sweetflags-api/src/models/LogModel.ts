import { Schema, Model, model } from 'mongoose';
import { ILog } from '../interfaces/ILog';

const logSchema = new Schema({
  user: String,
  action: String,
  targetType: String,
  targetId: Schema.Types.ObjectId,
  message: String,
}, {
    timestamps: true,
});

const Log: Model<ILog> = model<ILog>('Log', logSchema);

export default Log;
