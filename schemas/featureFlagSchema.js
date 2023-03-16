const { Environment } = require('./environmentSchema');

const FeatureFlag = {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'The name of the feature flag' },
      description: { type: 'string', description: 'A description of the feature flag' },
      app: { type: 'string', description: 'The ID of the app associated with the feature flag' },
      environments: {
        type: 'array',
        description: 'The list of environments associated with the feature flag',
        items: {
          type: 'object',
          properties: {
            environment: Environment,
            isActive: {
              type: 'boolean',
              description: 'Whether the feature flag is active in this environment',
            },
            evaluationStrategy: {
              type: 'string',
              description: 'The strategy used to evaluate the feature flag',
              enum: ['IMMEDIATE', 'USER', 'PERCENTAGE', 'PROBABALISTIC'],
            },
            evaluationPercentage: {
              type: 'number',
              description:
                'The percentage of users that will see the feature flag when the evaluation strategy is "PERCENTAGE"',
            },
            allowedUsers: {
              type: 'array',
              description:
                'The list of user IDs that are allowed to see the feature flag when the evaluation strategy is "USER"',
              items: {
                type: 'string',
              },
            },
            disallowedUsers: {
              type: 'array',
              description:
                'The list of user IDs that are not allowed to see the feature flag when the evaluation strategy is "USER"',
              items: {
                type: 'string',
              },
            },
          },
        },
      },
      createdBy: {
        type: 'string',
        description: 'The name of the user who created the feature flag',
      },
      updatedBy: {
        type: 'string',
        description: 'The name of the user who last updated the feature flag',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: 'The date and time the feature flag was created',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        description: 'The date and time the feature flag was last updated',
      },
    },
  };
  
  module.exports = {
    FeatureFlag
  };
  