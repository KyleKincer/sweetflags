import { IFeatureFlag } from '../interfaces/IFeatureFlag';

function isIFeatureFlag(obj: any): obj is IFeatureFlag {
    return (
      typeof obj.name === 'string' &&
      typeof obj.app === 'object' && 
      Array.isArray(obj.environments) &&
      typeof obj.createdBy === 'string' &&
      obj.createdAt instanceof Date &&
      obj.updatedAt instanceof Date &&
      (!obj.description || typeof obj.description === 'string') &&
      (!obj.updatedBy || typeof obj.updatedBy === 'string') &&
      obj.environments.every((env: any) => {
        return (
          typeof env.environment === 'object' &&
          typeof env.isActive === 'boolean' &&
          typeof env.evaluationStrategy === 'string' &&
          (!env.evaluationPercentage || typeof env.evaluationPercentage === 'number') &&
          (!env.allowedUsers || Array.isArray(env.allowedUsers)) &&
          (!env.disallowedUsers || Array.isArray(env.disallowedUsers))
        );
      })
    );
  }

function isIFeatureFlagArray(obj: any[]): obj is IFeatureFlag[] {
  return obj.every(item => isIFeatureFlag(item));
}  
  
export { isIFeatureFlag, isIFeatureFlagArray };