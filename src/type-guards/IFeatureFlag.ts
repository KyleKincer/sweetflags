import { IFeatureFlag } from '../interfaces/IFeatureFlag';
import { isIApp } from './IApp'; 
import { isIEnvironment } from './IEnvironment'; 

function isIFeatureFlag(obj: any): obj is IFeatureFlag {
  const hasValidEnvironments = (environments: any[]): boolean => {
    return environments.every((env) => {
      return (
        (typeof env.environment === 'string' || isIEnvironment(env.environment)) &&
        typeof env.isActive === 'boolean' &&
        typeof env.evaluationStrategy === 'string' &&
        (typeof env.evaluationPercentage === 'undefined' || typeof env.evaluationPercentage === 'number') &&
        (typeof env.allowedUsers === 'undefined' || Array.isArray(env.allowedUsers)) &&
        (typeof env.disallowedUsers === 'undefined' || Array.isArray(env.disallowedUsers))
      );
    });
  };

  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    (typeof obj.description === 'undefined' || typeof obj.description === 'string') &&
    (typeof obj.app === 'string' || isIApp(obj.app)) &&
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