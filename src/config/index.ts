import dotenv from 'dotenv';

dotenv.config();

export const config = {
  db: {
    url: process.env.MONGO_URI,
  },
};
