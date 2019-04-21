import * as express from 'express';

import * as MESSAGE from '@/utils/return_message';
import { CardModel, ListModel } from '@/models';

const router = express.Router();

// API for testing
//show all list,just for test
router.get('/', (req, res) => {
  (async () => {
    const list = await ListModel.find({}); //WHY NOT SHOW REF
    res.send(list);
  })();
});
//end API for test ///////////////////////////////

//get list by id
router.get('/:_id', (req, res) => {
  const { _id } = req.params;
  (async () => {
    try {
      const list = await ListModel.find({ _id });
      res.send({ status: MESSAGE.QUERY_OK, list });
    } catch (error) {
      res.send({ status: error });
    }
  })();
});

// api delete by id
router.delete('/:_id', (req, res) => {
  var { _id } = req.params;
  (async () => {
    try {
      const list = await ListModel.deleteOne({ _id });
      await CardModel.deleteMany({ listId: _id });
      res.send({
        status: MESSAGE.DELETE_LIST_OK,
        list
      });
    } catch (error) {
      res.send({
        status: error
      });
    }
  })();
});

router.post('/add', (req, res) => {
  //body.members : list name => conver list id
  var { name, ownerId, boardId } = req.body;
  (async () => {
    try {
      const l = new ListModel({ name, ownerId, boardId });
      var list = await l.save();
      list = await ListModel.findOne({ _id: list._id });
      res.send({
        status: MESSAGE.ADD_LIST_OK,
        list
      });
    } catch (error) {
      res.send({
        status: error
      });
    }
  })();
});

//update info list  just edit name, archived
router.post('/edit', (req, res) => {
  const { _id, name, archived } = req.body;
  var list;
  (async () => {
    try {
      var obj = {};
      if (name !== null && name !== undefined) obj['name'] = name;
      if (archived !== null && archived !== undefined)
        obj['archived'] = String(archived).toLowerCase() == 'true' ? true : false;
      await ListModel.update({ _id }, { $set: obj });
      list = await ListModel.findOne({ _id });
      res.send({
        status: MESSAGE.EDIT_LIST_OK,
        list
      });
    } catch (error) {
      res.send({
        status: error
      });
    }
  })();
});

export default router;
