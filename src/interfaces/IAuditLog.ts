import { Document } from 'mongoose';

export interface IAuditLog extends Document {
  documentId: string;
  documentType: string;
  operation: string;
  updatedBy: string;
  updateDetails: any;
  createdAt: Date;
  updatedAt: Date;
}
