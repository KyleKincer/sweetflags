import { IUser, IUserInputDTO } from '../interfaces/IUser';
import { isIApp } from './IApp';
import { ObjectId } from 'mongodb';

function isIUser(obj: any): obj is IUser {
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

  const isMetadata = (metadata: any): boolean => {
    if (typeof metadata === 'undefined') {
      return true;
    }

    return metadata !== null && typeof metadata === 'object' && !Array.isArray(metadata);
  };

  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.externalId === 'string' &&
    (typeof obj.name === 'undefined' || typeof obj.name === 'string') &&
    isAppReference(obj.app) &&
    isMetadata(obj.metadata) &&
    typeof obj.isActive === 'boolean' &&
    typeof obj.createdBy === 'string' &&
    (typeof obj.updatedBy === 'undefined' || typeof obj.updatedBy === 'string') &&
    obj.createdAt instanceof Date &&
    obj.updatedAt instanceof Date
  );
}

function isIUserArray(obj: any[]): obj is IUser[] {
  return obj.every(item => isIUser(item));
}

function isIUserInputDTO(obj: any): obj is IUserInputDTO {
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

    const isMetadata = (metadata: any): boolean => {
        if (typeof metadata === 'undefined') {
            return true;
        }
        
        return metadata !== null && typeof metadata === 'object' && !Array.isArray(metadata);
    };
    
    return (
        obj &&
        typeof obj.externalId === 'string' &&
        (typeof obj.name === 'undefined' || typeof obj.name === 'string') &&
        isAppReference(obj.app) &&
        isMetadata(obj.metadata) &&
        typeof obj.isActive === 'boolean' &&
        typeof obj.createdBy === 'string' &&
        (typeof obj.updatedBy === 'undefined' || typeof obj.updatedBy === 'string')
    );
}

export { isIUser, isIUserArray, isIUserInputDTO };
