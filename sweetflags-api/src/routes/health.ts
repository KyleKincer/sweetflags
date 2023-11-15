import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({ message: 'OK' });
});

router.post('/cleardb', async (req, res) => {
    try {
        // Drop the database
        await mongoose.connection.dropDatabase();

        console.log('Database cleared.');
    } catch (error) {
        console.error('Error while clearing the database:', error);
    }
});


export default router;