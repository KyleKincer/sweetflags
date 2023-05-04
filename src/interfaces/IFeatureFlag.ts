import { Document, Schema } from 'mongoose';
import { IEnvironment } from './IEnvironment';
import { IApp } from './IApp';
import { IUser } from './IUser';
import { ObjectId } from 'mongoose';

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
    allowedUsers?: Schema.Types.ObjectId[] | IUser[];
    disallowedUsers?: Schema.Types.ObjectId[] | IUser[];
    updatedBy?: string;
  }[];
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFeatureFlagInputDTO {
  name: string;
  appId: string;
  isActive: boolean;
  createdBy: string;
  description?: string;
  evaluationStrategy: string;
  evaluationPercentage?: number;
  allowedUsers?: Array<ObjectId>;
  disallowedUsers?: Array<ObjectId>;
}

export interface IFeatureFlagUpdateDTO {
  environmentId: string;
  isActive?: boolean;
  evaluationStrategy?: string;
  evaluationPercentage?: number;
  allowedUsers?: Array<ObjectId>;
  disallowedUsers?: Array<ObjectId>;
  updatedBy: string;
}

export interface IFeatureFlagToggleDTO {
  id: string;
  environmentId: string;
  updatedBy: string;
}