import express from 'express';
import dotenv from 'dotenv';
import { apiRouter } from '../server/routes.ts';

dotenv.config();

const app = express();

app.use(express.json({ limit: '40mb' }));
app.use(express.urlencoded({ extended: true, limit: '40mb' }));

// Mount API router
app.use('/api', apiRouter);

export default app;
