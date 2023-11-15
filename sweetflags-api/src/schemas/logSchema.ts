const Log = {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'The ID of the log',
      },
      user: {
        type: 'string',
        description: 'The name of the user who performed the action',
      },
      action: {
        type: 'string',
        description: 'The type of action performed',
      },
      targetType: {
        type: 'string',
        description: 'The type of the target entity affected by the action',
      },
      targetId: {
        type: 'string',
        description: 'The ID of the target entity affected by the action',
      },
      message: {
        type: 'string',
        description: 'A message describing the action',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: 'The date and time the log was created',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        description: 'The date and time the log was last updated',
      },
    },
  };
  
  export { Log };
  