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

function isIAppArray(obj: any): obj is Array<IApp> {
  return (
    obj &&
    Array.isArray(obj) &&
    obj.every((item) => isIApp(item))
  );
}

export { isIApp, isIAppArray };