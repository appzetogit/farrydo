import mongoose from 'mongoose';
import { env } from './env.js';
import { configureTransactionSupport } from './transactionSupport.js';

export const connectDatabase = async () => {
  mongoose.set('strictQuery', true);

  const connection = await mongoose.connect(env.mongoUri, {
    autoIndex: env.nodeEnv !== 'production',
    dbName: env.mongoDbName,
  });

  const { host, name } = connection.connection;
  console.log(`MongoDB connected to ${host}/${name}`);

  await configureTransactionSupport(connection.connection);
};
