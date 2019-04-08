
import * as express from "express";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as mongoose from 'mongoose';

import {MONGO_URI } from './db/utils/dbConfig';
import user  from './db/api/user';
import card  from './db/api/card';
import board  from './db/api/board';
import list  from './db/api/list';
import comment  from './db/api/comment';

const app = express();
const PORT =  4000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.set('useCreateIndex', true);
(mongoose as any).Promise = Promise;
mongoose.connect(MONGO_URI, { useNewUrlParser: true });

app.use('/api/users', user);
app.use('/api/cards', card);
app.use('/api/boards', board);
app.use('/api/lists', list);
app.use('/api/comments', comment);

// logger
app.use('/**', (req, res, next) => {
  console.log(
    `[${req.method}] ${req.originalUrl} || ${JSON.stringify(req.body)}`
  );
  next();
});

app.listen(PORT, err => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Database is listening on port ${PORT}`);
  }
});
