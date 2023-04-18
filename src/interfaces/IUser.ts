import { Document, Schema } from 'mongoose';
import { IApp } from './IApp';

export interface IUser extends Document {
    id: string;
    externalId: string;
    name?: string;
    app: Schema.Types.ObjectId | IApp;
    metadata?: Record<string, any>;
    isActive: boolean;
    createdBy: string;
    updatedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}
