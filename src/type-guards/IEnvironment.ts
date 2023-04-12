import { IEnvironment } from '../interfaces/IEnvironment';
import { isIApp } from './IApp';
import { ObjectId } from 'mongodb';

function isIEnvironment(obj: any): obj is IEnvironment {
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
    isAppReference(obj.app) && 
    (typeof obj.description === 'undefined' || typeof obj.description === 'string') &&
    (typeof obj.isActive === 'undefined' || typeof obj.isActive === 'boolean') &&
    typeof obj.createdBy === 'string' &&
    (typeof obj.updatedBy === 'undefined' || typeof obj.updatedBy === 'string')
  );
}

export { isIEnvironment };