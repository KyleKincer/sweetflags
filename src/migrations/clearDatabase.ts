import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export async function clearDatabase() {
  try {
    // Connect to the database
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

    // Drop the database
    await mongoose.connection.db.dropDatabase();

    console.log('Database cleared.');

    // Close the connection
    await mongoose.connection.close();

    console.log('Connection closed.');
  } catch (error) {
    console.error('Error while clearing the database:', error);
    process.exit(1);
  }
}

clearDatabase();
