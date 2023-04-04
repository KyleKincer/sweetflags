import { Document, Schema } from 'mongoose';
import { IEnvironment } from './IEnvironment';
import { IApp } from './IApp';

export interface IFeatureFlag extends Document {
    id: string;
    name: string;
    description?: string;
    app: Schema.Types.ObjectId | IApp;
    environments: {
        environment: Schema.Types.ObjectId | IEnvironment;
        isActive: boolean;
        evaluationStrategy: string;
        evaluationPercentage?: number;
        allowedUsers?: string[];
        disallowedUsers?: string[];
      }[];
    createdBy: string;
    updatedBy?: string;
    createdAt: Date;
    updatedAt: Date;
  }