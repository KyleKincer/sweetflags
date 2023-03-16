const swaggerJSDoc = require('swagger-jsdoc');
const { FeatureFlag } = require('./schemas/featureFlagSchema');
const { App } = require('./schemas/appSchema');
const { Environment } = require('./schemas/environmentSchema');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SweetFlags',
      version: '1.0.0',
      description: 'A pretty sweet feature flagging service',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
      components: {
        schemas: {
            FeatureFlag, 
            App,
            Environment
        },
    },
  },
  apis: ['./routes/*.js'],
};

const specs = swaggerJSDoc(options);

module.exports = specs;
