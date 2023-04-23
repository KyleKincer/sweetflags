import { Schema, Model, model } from 'mongoose';
import { IAuditLog } from '../interfaces/IAuditLog';

const auditLogSchema: Schema = new Schema({
  documentId: { type: Schema.Types.ObjectId, required: true },
  documentType: { type: String, required: true },
  operation: { type: String, required: true },
  updatedBy: { type: String, required: true },
  updateDetails: { type: Schema.Types.Mixed },
}, {
  timestamps: true,
});

const AuditLog: Model<IAuditLog> = model<IAuditLog>('AuditLog', auditLogSchema);

export default AuditLog;
