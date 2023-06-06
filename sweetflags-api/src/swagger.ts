import swaggerJSDoc from 'swagger-jsdoc';
import { FeatureFlag, IConfigInputDTO } from './schemas/featureFlagSchema';
import { App } from './schemas/appSchema';
import { Environment } from './schemas/environmentSchema';
import { User, UserInputDTO } from './schemas/userSchema';
import { Log } from './schemas/logSchema';
import path from 'path';

const options: swaggerJSDoc.Options = {
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
        IConfigInputDTO,
        App,
        Environment,
        User,
        UserInputDTO,
        Log,
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [path.join(__dirname, './routes/*.ts')],
};

const specs = swaggerJSDoc(options);

export default specs;
