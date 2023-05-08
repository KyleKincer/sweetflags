import { App } from './appSchema';

const User = {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'The user ID' },
      externalId: { type: 'string', description: 'The external user ID' },
      name: { type: 'string', description: "The user's name" },
      app: App,
      metadata: {
        type: 'object',
        additionalProperties: true,
        description: 'Additional metadata about the user',
      },
      isActive: { type: 'boolean', description: 'Whether the user is active' },
      createdBy: { type: 'string', description: 'The ID of the user who created this user' },
      updatedBy: { type: 'string', description: 'The ID of the user who last updated this user' },
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: 'The date and time when the user was created',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        description: 'The date and time when the user was last updated',
      },
    },
  };
  
  const UserInputDTO = {
    type: 'object',
    properties: {
      externalId: { type: 'string', description: 'The external user ID' },
      name: { type: 'string', description: "The user's name" },
      app: { type: 'string', description: 'The ID of the app associated with the user' },
      metadata: {
        type: 'object',
        additionalProperties: true,
        description: 'Additional metadata about the user',
        nullable: true,
      },
      isActive: { type: 'boolean', description: 'Whether the user is active' },
      createdBy: { type: 'string', description: 'The ID of the user who created this user' },
      updatedBy: { type: 'string', description: 'The ID of the user who last updated this user' },
    },
  };
  
  export { User, UserInputDTO };
  