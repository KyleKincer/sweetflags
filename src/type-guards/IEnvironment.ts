import { IEnvironment } from '../interfaces/IEnvironment';
import { isIApp } from './IApp';

function isIEnvironment(obj: any): obj is IEnvironment {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    (typeof obj.app === 'string' || isIApp(obj.app)) && 
    (typeof obj.description === 'undefined' || typeof obj.description === 'string') &&
    (typeof obj.isActive === 'undefined' || typeof obj.isActive === 'boolean') &&
    typeof obj.createdBy === 'string' &&
    (typeof obj.updatedBy === 'undefined' || typeof obj.updatedBy === 'string')
  );
}

export { isIEnvironment };