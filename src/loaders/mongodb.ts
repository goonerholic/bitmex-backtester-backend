import mongoose from 'mongoose';

export default async function mongoLoader(url: string) {
  const db = await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
  console.log('Mongodb started.');
  return db.connection.db;
}
