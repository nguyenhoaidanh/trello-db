import * as express from 'express';

import * as MESSAGE from '@/utils/return_message';
import {
  LogModel,
} from '@/models';

const router = express.Router();

// API for testing
//show all log,just for test
router.get('/', (req, res) => {
  (async () => {
    const log = await LogModel.find({});
    res.send(log);
  })();
});
//end API for test

//get log by id
router.get('/:_id', (req, res) => {
  const { _id } = req.params;
  (async () => {
    try {
      const log = await LogModel.find({ _id });
      if (!log) res.send({ status: MESSAGE.NOT_FOUND });
      else res.send({ status: MESSAGE.QUERY_OK, log });
    } catch (error) {
      res.send({ status: error });
    }
  })();
});

// api delete by _id
router.delete('/:_id', (req, res) => {
  var { _id } = req.params;
  (async () => {
    try {
      const log = await LogModel.deleteOne({ _id });
      res.send({ status: MESSAGE.DELETE_LOG_OK, log });
    } catch (error) {
      res.send({ status: error });
    }
  })();
});

router.post('/add', (req, res) => {
  var {
    action, object, ownerId
  } = req.body;
  (async () => {
    try {
      const l = new LogModel({
        action, object, ownerId
      });
      var log = await l.save();
      res.send({
        status: MESSAGE.ADD_LOG_OK,
        log
      });
    } catch (error) {
      res.send({
        status: error
      });
    }
  })();
});


export default router;
