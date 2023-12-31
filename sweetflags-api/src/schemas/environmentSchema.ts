import { App } from './appSchema';

const Environment = {
    type: 'object',
    properties: {
      id: { 
        type: 'string', 
        description: 'The ID of the environment' },
      name: { 
        type: 'string', 
        description: 'The name of the environment' },
      app: App,
      description: { 
        type: 'string', 
        description: 'A description of the environment' },
      isActive: {
        type: 'boolean',
        description: 'Whether the environment is active or not',
        default: true,
      },
      createdBy: {
        type: 'string',
        description: 'The name of the user who created the environment',
      },
      updatedBy: {
        type: 'string',
        description: 'The name of the user who last updated the environment',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: 'The date and time the environment was created',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        description: 'The date and time the environment was last updated',
      },
    },
  };
  
export { Environment };
