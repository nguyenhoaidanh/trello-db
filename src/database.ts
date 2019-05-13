import * as mongoose from 'mongoose';

import { MONGODB_URI, MONGODB_OPTION } from '@/config';

mongoose.set('useCreateIndex', true);
(mongoose as any).Promise = Promise;

const connect_mongo = async () => {
  const db = await mongoose
    .connect(
      MONGODB_URI,
      { useNewUrlParser: true, ...MONGODB_OPTION }
    )
    .catch(err => {
      throw err;
    });
  return db;
};

export default connect_mongo;
