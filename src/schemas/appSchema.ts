const App = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'The name of the app',
      },
      description: {
        type: 'string',
        description: 'A description of the app',
      },
      isActive: {
        type: 'boolean',
        description: 'Whether the app is active or not',
      },
      createdBy: {
        type: 'string',
        description: 'The name of the user who created the app',
      },
      updatedBy: {
        type: 'string',
        description: 'The name of the user who last updated the app',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: 'The date and time the app was created',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        description: 'The date and time the app was last updated',
      },
    },
  };
  
  export { App };
  