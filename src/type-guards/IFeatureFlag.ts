import { IFeatureFlag } from '../interfaces/IFeatureFlag';
import { isIApp } from './IApp'; 
import { isIEnvironment } from './IEnvironment'; 
import { isIUserArray } from './IUser';
import { ObjectId } from 'mongodb';

function isIFeatureFlag(obj: any): obj is IFeatureFlag {
  const hasValidEnvironments = (environments: any[]): boolean => {
    return environments.every((env) => {
      return (
        (typeof env.environment === 'string' || isIEnvironment(env.environment)) &&
        typeof env.isActive === 'boolean' &&
        typeof env.evaluationStrategy === 'string' &&
        (typeof env.evaluationPercentage === 'undefined' || typeof env.evaluationPercentage === 'number') &&
        (typeof env.allowedUsers === 'undefined' || env.allowedUsers.every(isObjectId)) || isIUserArray(env.allowedUsers) &&
        (typeof env.disallowedUsers === 'undefined' || env.disallowedUsers.every(isObjectId) || isIUserArray(env.disallowedUsers))
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

function isIFeatureFlagArray(obj: any[]): obj is IFeatureFlag[] {
  return obj.every(item => isIFeatureFlag(item));
}  
  
export { isIFeatureFlag, isIFeatureFlagArray };