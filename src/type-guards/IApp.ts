import { IApp } from '../interfaces/IApp';

function isIApp(obj: any): obj is IApp {
  return (
    obj &&
    typeof obj.name === 'string' &&
    (typeof obj.description === 'undefined' || typeof obj.description === 'string') &&
    typeof obj.isActive === 'boolean' &&
    typeof obj.createdBy === 'string'
  );
}

export { isIApp };