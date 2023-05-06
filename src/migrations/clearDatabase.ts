import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export async function clearDatabase() {
  try {
    // Drop the database
    await mongoose.connection.dropDatabase();

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
