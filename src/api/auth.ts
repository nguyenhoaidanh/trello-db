import * as express from 'express';
import * as mongoose from 'mongoose';

import * as MESSAGE from '@/utils/return_message';
import {
  BoardModel,
  CardModel,
  CommentModel,
  ListModel,
  UserModel,
  LogModel
} from '@/models';

const router = express.Router();
var ObjectId = mongoose.Types.ObjectId;

router.get('/me', (req, res) => {
  (async () => {
    const user = await UserModel.find({});
    res.send(user);
  })();
});

//get board by id
router.get('/:_id', (req, res) => {
  const { _id } = req.params;
  (async () => {
    try {
      const board = await BoardModel.find({ _id });
      res.send({ status: MESSAGE.QUERY_OK, board });
    } catch (error) {
      res.send({ status: error });
    }
  })();
});


export default router;
