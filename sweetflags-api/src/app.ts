import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import healthRouter from './routes/health';
import configRouter from './routes/configs';
import appRouter from './routes/apps';
import environmentRouter from './routes/environments';
import userRouter from './routes/users';
import logRouter from './routes/logs';
import swaggerUi from 'swagger-ui-express';
import specs from './swagger';
import 'dd-trace/init';

dotenv.config();
console.log('Starting server');

async function connectToDb() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');
  } catch (err) {
    console.error('Error connecting to database:', err);
    throw err;
  }

  // Add index on flags collection
  await mongoose.connection.db.collection('flags').createIndex({ app: 1, name: 1 });

  const app = express();

  const port = process.env.PORT || 3000;
  app.set('port', port);

  // Set up Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

  app.use(cors());
  app.use(bodyParser.json());

  app.use('/api/healthz', healthRouter);
  app.use('/api/configs', configRouter);
  app.use('/api/apps', appRouter);
  app.use('/api/environments', environmentRouter);
  app.use('/api/users', userRouter);
  app.use('/api/logs', logRouter);

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

connectToDb();
