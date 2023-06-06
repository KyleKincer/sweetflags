import { Environment } from './environmentSchema';

const FeatureFlag = {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'The ID of the feature flag' },
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
              enum: ['BOOLEAN', 'USER', 'PERCENTAGE', 'PROBABALISTIC'],
            },
            evaluationPercentage: {
              type: 'number',
              description:
                'The percentage of users that will see the feature flag when the evaluation strategy is "PERCENTAGE"',
            },
            allowedUsers: {
              type: 'array',
              description:
                'The list of user IDs for whom the feature flag is enabled when the evaluation strategy is "USER"',
              items: {
                type: 'string',
              },
            },
            disallowedUsers: {
              type: 'array',
              description:
                'The list of user IDs for whom the feature flag is disabled when the evaluation strategy is "USER"',
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

  const IConfigInputDTO = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'The name of the feature flag',
      },
      appId: {
        type: 'string',
        description: 'The ID of the app the feature flag belongs to',
      },
      isActive: {
        type: 'boolean',
        description: 'The initial active state of the feature flag',
      },
      createdBy: {
        type: 'string',
        description: 'The ID of the user who created the feature flag',
      },
      description: {
        type: 'string',
        description: 'The description of the feature flag',
        nullable: true,
      },
      evaluationStrategy: {
        type: 'string',
        description: 'The evaluation strategy for the feature flag',
      },
      evaluationPercentage: {
        type: 'number',
        description: 'The evaluation percentage for the feature flag',
        nullable: true,
      },
      allowedUsers: {
        type: 'array',
        items: {
          type: 'string',
        },
        description: 'The list of allowed user ObjectIds for the feature flag',
        nullable: true,
      },
      disallowedUsers: {
        type: 'array',
        items: {
          type: 'string',
        },
        description: 'The list of disallowed user ObjectIds for the feature flag',
        nullable: true,
      },
    },
    required: ['name', 'appId', 'isActive', 'createdBy'],
  };
  
export { FeatureFlag, IConfigInputDTO };
  