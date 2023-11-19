import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import healthRouter from './routes/health';
import flagRouter from './routes/flags';
import appRouter from './routes/apps';
import environmentRouter from './routes/environments';
import userRouter from './routes/users';
import logRouter from './routes/logs';
import swaggerUi from 'swagger-ui-express';
import specs from './swagger';
import 'dd-trace/init';
import os from 'os';

dotenv.config();
console.log('Starting server');

// Print the IP address
const networkInterfaces = os.networkInterfaces();
if (networkInterfaces) {
  for (const name of Object.keys(networkInterfaces)) {
    const nets = networkInterfaces[name];
    if (nets) {
      for (const net of nets) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        if (net.family === 'IPv4' && !net.internal) {
          console.log('IP Address:', net.address);
        }
      }
    }
  }
}

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
  app.use('/api/flags', flagRouter);
  app.use('/api/apps', appRouter);
  app.use('/api/environments', environmentRouter);
  app.use('/api/users', userRouter);
  app.use('/api/logs', logRouter);

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

connectToDb();
