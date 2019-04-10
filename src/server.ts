import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as gracefulShutdown from 'http-graceful-shutdown';

import { PORT } from '@/config';

import { board, card, comment, list, user } from '@/api';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// logger
app.use('/**', (req, res, next) => {
  console.log(
    `[${req.method}] ${req.originalUrl} || ${JSON.stringify(req.body)}`
  );
  next();
});

app.use('/api/users', user);
app.use('/api/cards', card);
app.use('/api/boards', board);
app.use('/api/lists', list);
app.use('/api/comments', comment);

// error handler
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500);
  res.end();
});

const start_server = () =>
  new Promise((resolve, reject) => {
    const s = app.listen(PORT, err => {
      if (err) {
        reject(err);
      } else {
        console.log(`Server start on port ${PORT}`);
        gracefulShutdown(s);
        resolve(s);
      }
    });
  });

export default start_server;
