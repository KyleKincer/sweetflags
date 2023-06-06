import { Document, Schema } from 'mongoose';
import { IEnvironment } from './IEnvironment';
import { IApp } from './IApp';
import { IUser } from './IUser';
import { ObjectId } from 'mongoose';

export enum ConfigType {
  BOOLEAN = 'BOOLEAN',
  JSON = 'JSON',
  TEXT = 'TEXT',
  ENUM = 'ENUM',
}

export enum EvaluationStrategy {
  BOOLEAN = 'BOOLEAN',
  USER = 'USER',
  PERCENTAGE = 'PERCENTAGE',
  PROBABALISTIC = 'PROBABALISTIC',
}

export interface IConfig extends Document {
  id: string;
  name: string;
  description?: string;
  app: Schema.Types.ObjectId | IApp;
  environments: {
    environment: Schema.Types.ObjectId | IEnvironment;
    type: ConfigType;
    stringValue?: string;
    jsonValue?: Record<string, any>;
    enumValues?: string[];
    enumValue?: string;
    isActive: boolean; // TODO: Rename to booleanValue
    evaluationStrategy: EvaluationStrategy;
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


export interface IConfigInputDTO {
  name: string;
  appId: string;
  createdBy: string;
  description?: string;
  type: ConfigType;
  stringValue?: string;
  jsonValue?: Record<string, any>;
  enumValues?: string[];
  enumValue?: string;
  isActive: boolean;
  evaluationStrategy?: EvaluationStrategy;
  evaluationPercentage?: number;
  allowedUsers?: Array<ObjectId>;
  disallowedUsers?: Array<ObjectId>;
}

export interface IConfigUpdateDTO {
  environmentId: string;
  type?: ConfigType;
  stringValue?: string;
  jsonValue?: Record<string, any>;
  enumValues?: string[];
  enumValue?: string;
  isActive?: boolean;
  evaluationStrategy?: EvaluationStrategy;
  evaluationPercentage?: number;
  allowedUsers?: Array<ObjectId>;
  disallowedUsers?: Array<ObjectId>;
  updatedBy: string;
}

export interface IConfigToggleDTO {
  id: string;
  environmentId: string;
  updatedBy: string;
}