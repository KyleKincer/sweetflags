import { Environment } from './environmentSchema';

const Config = {
  type: 'object',
  properties: {
    id: { type: 'string', description: 'The ID of the config' },
    name: { type: 'string', description: 'The name of the config' },
    description: { type: 'string', description: 'A description of the config' },
    app: { type: 'string', description: 'The ID of the app associated with the config' },
    environments: {
      type: 'array',
      description: 'The list of environments associated with the config',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'The ID of the environment configuration' },
          environment: Environment,
          type: {
            type: 'string',
            description: 'The type of the value to return for the config',
            enum: ['BOOLEAN', 'JSON', 'TEXT', 'ENUM'],
          },
          value: { type: 'mixed', description: 'The value for the config based on its type' },
          enumValues: {
            type: 'array',
            description: 'The possible enum values for the config when the type is "ENUM"',
            items: { type: 'string' },
          },
          evaluationStrategy: {
            type: 'string',
            description: 'The strategy used to evaluate the config',
            enum: ['BOOLEAN', 'USER', 'PERCENTAGE', 'PROBABALISTIC'],
          },
          evaluationPercentage: {
            type: 'number',
            description: 'The percentage of users that will see the config when the evaluation strategy is "PERCENTAGE"',
          },
          allowedUsers: {
            type: 'array',
            description: 'The list of user IDs for whom the config is enabled when the evaluation strategy is "USER"',
            items: { type: 'string' },
          },
          disallowedUsers: {
            type: 'array',
            description: 'The list of user IDs for whom the config is disabled when the evaluation strategy is "USER"',
            items: { type: 'string' },
          },
          updatedBy: {
            type: 'string',
            description: 'The ID of the user who last updated the environment configuration',
          },
        },
        required: ['environment', 'type', 'evaluationStrategy', 'updatedBy'],
      },
    },
    createdBy: {
      type: 'string',
      description: 'The ID of the user who created the config',
    },
    updatedBy: {
      type: 'string',
      description: 'The ID of the user who last updated the config',
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      description: 'The date and time the config was created',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      description: 'The date and time the config was last updated',
    },
  },
  required: ['name', 'app', 'environments', 'createdBy', 'updatedBy'],
};

const IConfigInputDTO = {
  type: 'object',
  properties: {
    name: { type: 'string', description: 'The name of the config' },
    appId: { type: 'string', description: 'The ID of the app the config belongs to' },
    createdBy: { type: 'string', description: 'The ID of the user who created the config' },
    description: { type: 'string', description: 'The description of the config', nullable: true },
    type: {
      type: 'string',
      description: 'The type of the value to return for the config',
      enum: ['BOOLEAN', 'JSON', 'TEXT', 'ENUM'],
    },
    value: {
      type: 'mixed',
      description: 'The value for the config based on its type',
      nullable: true,
    },
    enumValues: {
      type: 'array',
      description: 'The possible enum values for the config when the type is "ENUM"',
      items: { type: 'string' },
      nullable: true,
    },
    evaluationStrategy: {
      type: 'string',
      description: 'The strategy used to evaluate the config',
      enum: ['BOOLEAN', 'USER', 'PERCENTAGE', 'PROBABALISTIC'],
      nullable: true,
    },
    evaluationPercentage: {
      type: 'number',
      description: 'The percentage of users that will see the config when the evaluation strategy is "PERCENTAGE"',
      nullable: true,
    },
    allowedUsers: {
      type: 'array',
      description: 'The list of allowed user IDs for the config',
      items: { type: 'string' },
      nullable: true,
    },
    disallowedUsers: {
      type: 'array',
      description: 'The list of disallowed user IDs for the config',
      items: { type: 'string' },
      nullable: true,
    },
  },
  required: ['name', 'appId', 'createdBy', 'type'],
};

export { Config, IConfigInputDTO };
