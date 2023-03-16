const swaggerJSDoc = require('swagger-jsdoc');
const { FeatureFlag } = require('./schemas/featureFlagSchema');

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
            FeatureFlag
        },
    },
  },
  apis: ['./routes/*.js'],
};

const specs = swaggerJSDoc(options);

module.exports = specs;
