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
          environment: Environment,
          isActive: {
            type: 'boolean',
            description: 'Whether the config is active in this environment',
          },
          evaluationStrategy: {
            type: 'string',
            description: 'The strategy used to evaluate the config',
            enum: ['BOOLEAN', 'USER', 'PERCENTAGE', 'PROBABALISTIC'],
          },
          type: {
            type: 'string',
            description: 'The type of the value to return for the config',
            enum: ['BOOLEAN', 'JSON', 'TEXT', 'ENUM'],
          },
          stringValue: {
            type: 'string',
            description: 'The string value for the config when the type is "TEXT"',
          },
          jsonValue: {
            type: 'object',
            description: 'The JSON value for the config when the type is "JSON"',
          },
          enumValues: {
            type: 'array',
            description: 'The possible enum values for the config when the type is "ENUM"',
            items: { type: 'string' },
          },
          enumValue: {
            type: 'string',
            description: 'The selected enum value for the config when the type is "ENUM"',
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
        },
      },
    },
    createdBy: {
      type: 'string',
      description: 'The name of the user who created the config',
    },
    updatedBy: {
      type: 'string',
      description: 'The name of the user who last updated the config',
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
};

const IConfigInputDTO = {
  type: 'object',
  properties: {
    name: { type: 'string', description: 'The name of the config' },
    appId: { type: 'string', description: 'The ID of the app the config belongs to' },
    isActive: { type: 'boolean', description: 'The initial active state of the config' },
    createdBy: { type: 'string', description: 'The ID of the user who created the config' },
    description: { type: 'string', description: 'The description of the config', nullable: true },
    evaluationStrategy: { type: 'string', description: 'The evaluation strategy for the config' },
    evaluationPercentage: { type: 'number', description: 'The evaluation percentage for the config', nullable: true },
    allowedUsers: {
      type: 'array',
      items: { type: 'string' },
      description: 'The list of allowed user ObjectIds for the config',
      nullable: true,
    },
    disallowedUsers: {
      type: 'array',
      items: { type: 'string' },
      description: 'The list of disallowed user ObjectIds for the config',
      nullable: true,
    },
  },
  required: ['name', 'appId', 'isActive', 'createdBy'],
};

export { Config, IConfigInputDTO };
