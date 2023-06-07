import { IConfig } from '../interfaces/IConfig';
import { isIApp } from './IApp'; 
import { isIEnvironment } from './IEnvironment'; 
import { isIUserArray } from './IUser';
import { ObjectId } from 'mongodb';

function isIConfig(obj: any): obj is IConfig {
  const hasValidEnvironments = (environments: any[]): boolean => {
    return environments.every((env) => {
      const isEnumArray = (enumValues: any[]): boolean => {
        return Array.isArray(enumValues) && enumValues.every(val => typeof val === 'string');
      };

      const isValueValid = (value: any): boolean => {
        return typeof value === 'boolean' ||
          typeof value === 'string' ||
          (typeof value === 'object' && !Array.isArray(value));
      };

      return (
        (typeof env.environment === 'string' || isIEnvironment(env.environment)) &&
        typeof env.type === 'string' &&
        (typeof env.value === 'undefined' || isValueValid(env.value)) &&
        (typeof env.enumValues === 'undefined' || isEnumArray(env.enumValues)) &&
        (typeof env.evaluationStrategy === 'undefined' || typeof env.evaluationStrategy === 'string') &&
        (typeof env.evaluationPercentage === 'undefined' || typeof env.evaluationPercentage === 'number') &&
        (typeof env.allowedUsers === 'undefined' || env.allowedUsers.every(isObjectId) || isIUserArray(env.allowedUsers)) &&
        (typeof env.disallowedUsers === 'undefined' || env.disallowedUsers.every(isObjectId) || isIUserArray(env.disallowedUsers)) &&
        (typeof env.updatedBy === 'undefined' || typeof env.updatedBy === 'string')
      );
    });
  };

  const isObjectId = (id: any): boolean => {
    try {
      return ObjectId.isValid(id) && new ObjectId(id).toString() === id.toString();
    } catch (error) {
      return false;
    }
  };

  const isAppReference = (app: any): boolean => {
    return typeof app === 'string' || isIApp(app) || isObjectId(app);
  };

  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    (typeof obj.description === 'undefined' || typeof obj.description === 'string') &&
    isAppReference(obj.app) &&
    Array.isArray(obj.environments) &&
    hasValidEnvironments(obj.environments) &&
    typeof obj.createdBy === 'string' &&
    (typeof obj.updatedBy === 'undefined' || typeof obj.updatedBy === 'string') &&
    obj.createdAt instanceof Date &&
    obj.updatedAt instanceof Date
  );
}


function isIConfigArray(obj: any[]): obj is IConfig[] {
  return obj.every(item => isIConfig(item));
}  
  
export { isIConfig, isIConfigArray };