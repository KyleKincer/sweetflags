import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import flagRouter from './routes/flags';
import appRouter from './routes/apps';
import environmentRouter from './routes/environments';
import config from './config';
import swaggerUi from 'swagger-ui-express';
import specs from './swagger';

async function connectToDb() {
  try {
    await mongoose.connect(config.mongoConnectionString);
    console.log('Connected to database');
  } catch (err) {
    console.error('Error connecting to database:', err);
  }

  const app = express();

  const port = process.env.PORT || 3000;
  app.set('port', port);

  // Set up Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  app.use(bodyParser.json());
  app.use('/api/flags', flagRouter);
  app.use('/api/apps', appRouter);
  app.use('/api/environments', environmentRouter);

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

connectToDb();
