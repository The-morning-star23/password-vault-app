// src/lib/dbConnect.ts

import mongoose from 'mongoose';

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
  // If we're already connected, don't connect again
  if (connection.isConnected) {
    console.log('Already connected to the database');
    return;
  }

  try {
    // Attempt to connect to the database
    const db = await mongoose.connect(process.env.MONGODB_URI || '', {});

    connection.isConnected = db.connections[0].readyState;

    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    
    // Graceful exit
    process.exit(1);
  }
}

export default dbConnect;