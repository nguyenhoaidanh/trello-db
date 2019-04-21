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

// API for testing
//show all board,just for test
router.get('/', (req, res) => {
  (async () => {
    const board = await BoardModel.find({});
    res.send(board);
  })();
});
//end API for test ///////////////////////////////


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

// api delete by _id
router.delete('/:_id', (req, res) => {
  var { _id } = req.params;
  var { ownerId } = req.body;
  (async () => {
    try {
      const board = await BoardModel.findOne({ _id });
      if (board === null) res.send({ status: MESSAGE.NOT_FOUND });
      else if (String(board.ownerId) !== ownerId)
        res.send({ status: MESSAGE.NOT_PERMITION });
      else {
        await BoardModel.deleteOne({ _id });
        await ListModel.deleteMany({ boardId: _id });
        //add to log
        const l = new LogModel({ ownerId, action: 'Deleted board', object: board.name });
        await l.save();
        //
        res.send({
          status: MESSAGE.DELETE_BOARD_OK
        });
      }
    } catch (error) {
      res.send({
        status: error
      });
    }
  })();
});

router.post('/add', (req, res) => {
  //body.members : list name => conver list id
  var { name, ownerId, modeView, background, members } = req.body;
  (async () => {
    try {
      const b = new BoardModel({ name, ownerId, modeView, background });
      var board = await b.save();
      if (members !== null && members !== undefined)
        for (let name of members) {
          // conver name --> _id
          const memId = await UserModel.findOne({ username: name });
          await BoardModel.updateOne(
            { _id: board._id },
            { $push: { members: new ObjectId(String(memId._id)) } }
          );
        }
      board = await BoardModel.findOne({ _id: board._id });
      //add to log
      const l = new LogModel({ ownerId, action: 'Created board', object: board.name });
      await l.save();
      //
      res.send({
        status: MESSAGE.ADD_BOARD_OK,
        board
      });
    } catch (error) {
      res.send({
        status: error
      });
    }
  })();
});

//update info board: name, modeView, background
router.post('/edit', (req, res) => {
  const { _id, name, modeView, background, ownerId } = req.body;
  (async () => {
    try {
      var existboard = await BoardModel.findOne({ _id });
      if (String(existboard.ownerId) !== ownerId) res.send({ status: MESSAGE.NOT_PERMITION });
      else if (existboard === null) res.send({ status: MESSAGE.NOT_FOUND });
      var obj = {};
      if (name !== null && name !== undefined)
        //field which was modified will update, else not update
        obj['name'] = name;
      if (modeView !== null && modeView !== undefined)
        obj['modeView'] = String(modeView).toLowerCase() == 'true' ? true : false;
      if (background !== null && background !== undefined)
        obj['background'] = background;
      await BoardModel.update({ _id }, { $set: obj });
      const board = await BoardModel.findOne({ _id });
      //add to log
      const l = new LogModel({ ownerId, action: 'Edited board', object: board.name });
      await l.save();
      //
      res.send({
        status: MESSAGE.EDIT_BOARD_OK,
        board
      });
    } catch (error) {
      res.send({
        status: error
      });
    }
  })();
});

//add memm
router.post('/add-member', (req, res) => {
  //add one member
  var { _id, newMemberName } = req.body; //newMember is name
  (async () => {
    try {
      const newMember = await UserModel.findOne({ username: newMemberName });
      await BoardModel.updateOne(
        { _id },
        { $addToSet: { members: new ObjectId(String(newMember._id)) } }
      );
      const board = await BoardModel.findOne({ _id });
      res.send({
        status: MESSAGE.ADD_MEMBER_OK,
        board
      });
    } catch (error) {
      res.send({
        status: error
      });
    }
  })();
});

router.post('/remove-member', (req, res) => {
  var { _id, memberName } = req.body; //memberName is name
  (async () => {
    try {
      const Member = await UserModel.findOne({ username: memberName });
      await BoardModel.updateOne(
        { _id },
        { $pull: { members: new ObjectId(String(Member._id)) } }
      );
      const board = await BoardModel.findOne({ _id });
      res.send({
        status: MESSAGE.DELETE_MEMBER_OK,
        board
      });
    } catch (error) {
      res.send({
        status: error
      });
    }
  })();
});

//query all list of board
router.get('/:_id/lists', (req, res) => {
  var { _id } = req.params;
  (async () => {
    try {
      var thisBoard = await BoardModel.find({ _id });
      thisBoard = thisBoard[0];
      var members = await UserModel.find(
        { _id: { $in: thisBoard.members } },
        { username: 1, imageUrl: 1 }
      );
      thisBoard.members = members;
      var lists = await ListModel.find({ boardId: _id }).sort({ dateCreate: 1 });
      for (let l of lists) {
        var cards = await CardModel.find({ listId: l._id })
          .populate('ownerId', 'username imageUrl')
          .sort({ order: 1 });
        for (let c of cards) {
          var comments = await CommentModel.find({ cardId: c._id }, { _id: 1 });
          var t = [];
          for (let x of comments) t.push(x._id);
          c.comments = t;
        }
        l.cards = cards;
      }
      thisBoard.lists = lists;
      res.send({
        status: MESSAGE.QUERY_OK,
        thisBoard
      });
    } catch (error) {
      res.send({
        status: error
      });
    }

  })();
});
export default router;
