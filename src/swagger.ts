import swaggerJSDoc from 'swagger-jsdoc';
import { FeatureFlag, IFeatureFlagInputDTO } from './schemas/featureFlagSchema';
import { App } from './schemas/appSchema';
import { Environment } from './schemas/environmentSchema';
import { User, UserInputDTO } from './schemas/userSchema';
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
        IFeatureFlagInputDTO,
        App,
        Environment,
        User,
        UserInputDTO,
      },
    },
  },
  apis: [path.join(__dirname, './routes/*.ts')],
};

const specs = swaggerJSDoc(options);

export default specs;
