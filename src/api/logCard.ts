import * as express from 'express';

import * as MESSAGE from '@/utils/return_message';
import {
  LogCardModel,
} from '@/models';

const router = express.Router();

// API for testing
//show all logCard,just for test
router.get('/', (req, res) => {
  (async () => {
    const logCard = await LogCardModel.find({});
    res.send(logCard);
  })();
});
//end API for test

//get logCard by id
router.get('/:_id', (req, res) => {
  const { _id } = req.params;
  (async () => {
    try {
      const logCard = await LogCardModel.find({ _id }).populate('ownerId', 'username imageUrl');
      res.send({ status: MESSAGE.QUERY_OK, logCard });
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
      const logCard = await LogCardModel.deleteOne({ _id });
      res.send({ status: MESSAGE.DELETE_LOG_OK, logCard });
    } catch (error) {
      res.send({ status: error });
    }

  })();
});

router.post('/add', (req, res) => {
  var {
    action, cardId, ownerId
  } = req.body;
  (async () => {
    try {
      const lc = new LogCardModel({
        action, cardId, ownerId
      });
      var logCard = await lc.save();
      res.send({
        status: MESSAGE.ADD_LOG_OK,
        logCard
      });
    } catch (error) {
      res.send({
        status: error
      });
    }
  })();
});


export default router;
