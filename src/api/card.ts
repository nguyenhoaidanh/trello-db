import * as express from 'express';
import * as mongoose from 'mongoose';

import * as MESSAGE from '@/utils/return_message';
import {
  UserModel,
  CardModel,
  CommentModel,
  LogCardModel,
  ListModel
} from '@/models';

const router = express.Router();
var ObjectId = mongoose.Types.ObjectId;

// API for testing
//show all card,just for test
router.get('/', (req, res) => {
  (async () => {
    const card = await CardModel.find({});
    res.send(card);
  })();
});
//end API for test

//get card by id
router.get('/:_id', (req, res) => {
  const { _id } = req.params;
  (async () => {
    try {
      const card = await CardModel.find({ _id });
      res.send({ status: MESSAGE.QUERY_OK, card });
    } catch (error) {
      res.send({ status: error });
    }
  })();
});

// api delete by _id
router.delete('/:_id', (req, res) => {
  var { _id } = req.params;
  var { idUserRemove } = req.body;
  (async () => {
    try {
      var card = await CardModel.findOne({ _id });
      console.log(card);
      if (card === null) res.send({ status: MESSAGE.NOT_FOUND });
      else if (String(card.ownerId) !== idUserRemove) res.send({ status: MESSAGE.NOT_PERMITION });
      else {
        card = await CardModel.deleteOne({ _id });
        //also delete all comment of this card
        await CommentModel.deleteMany({ cardId: _id });
        await LogCardModel.deleteMany({ cardId: _id });
        res.send({ status: MESSAGE.DELETE_CARD_OK, card });
      }
    } catch (error) {
      res.send({ status: error });
    }
  })();
});

router.post('/add', (req, res) => {
  var { title, ownerId, listId, deadline, description, order, label, members, fileUrl } = req.body;
  (async () => {
    try {
      const c = new CardModel({
        title, ownerId, listId, deadline, description, order, label, fileUrl
      });
      var card = await c.save();
      if (members !== null && members !== undefined)
        for (let name of members) {
          // conver name --> _id
          const memId = await UserModel.findOne({ username: name });
          await CardModel.updateOne(
            { _id: card._id },
            { $push: { members: new ObjectId(String(memId._id)) } }
          );
        }
      card = await CardModel.findOne({ _id: card._id });
      //add to log
      var action = 'Created card';
      const l = new LogCardModel({ action, cardId: card._id, ownerId });
      await l.save();
      //
      res.send({
        status: MESSAGE.ADD_CARD_OK,
        card
      });
    } catch (error) {
      res.send({
        status: error
      });
    }
  })();
});

//update info card
router.post('/edit', (req, res) => {
  var { _id, title, deadline, description, label, order, archived, fileUrl, idUserEdit } = req.body;
  (async () => {
    try {
      var existCard = await CardModel.findOne({ _id });
      if (existCard === null) res.send({ status: MESSAGE.NOT_FOUND });
      else {
        var obj = {}; //field which was modified will update, else not update
        if (title !== null && title !== undefined) obj['title'] = title;
        if (deadline !== null && deadline !== undefined) obj['deadline'] = deadline;
        if (description !== null && description !== undefined) obj['description'] = description;
        if (label !== null && label !== undefined) obj['label'] = label;
        if (order !== null && order !== undefined) obj['order'] = order;
        if (fileUrl !== null && fileUrl !== undefined) obj['fileUrl'] = fileUrl;
        if (archived !== null && archived !== undefined) obj['archived'] = String(archived).toLowerCase() == 'true' ? true : false;
        var card = await CardModel.update({ _id }, { $set: obj });
        //add to log
        var action = 'Edited card';
        const l = new LogCardModel({ action, cardId: card._id, ownerId: idUserEdit });
        await l.save();
        //
        card = await CardModel.findOne({ _id });
        res.send({ status: MESSAGE.EDIT_CARD_OK, card });
      }
    } catch (error) {
      res.send({
        status: error
      });
    }
  })();
});

//add mem
router.post('/add-member', (req, res) => { //add one member
  var { _id, newMemberName, idUserAdd } = req.body; //newMember is a name
  (async () => {
    try {
      const newMember = await UserModel.findOne({ username: newMemberName });
      var card = await CardModel.findOne({ _id });
      if (card === null || newMember === null) res.send({ status: MESSAGE.NOT_FOUND });
      else {
        await CardModel.updateOne(
          { _id },
          { $addToSet: { members: new ObjectId(String(newMember._id)) } }
        );
        //add to log
        var action = `Added ${newMemberName} to this task`;
        const l = new LogCardModel({ action, cardId: card._id, ownerId: idUserAdd });
        await l.save();
        //
        card = await CardModel.findOne({ _id });
        res.send({ status: MESSAGE.ADD_MEMBER_OK, card });
      }
    } catch (error) {
      res.send({
        status: error
      });
    }
  })();
});

//remove mem
router.post('/remove-member', (req, res) => { //remove one member
  var { _id, memberName, idUserRemove } = req.body; //newMember is name
  (async () => {
    try {
      const Member = await UserModel.findOne({ username: memberName });
      var card = await CardModel.findOne({ _id });
      if (card === null || Member === null) res.send({ status: MESSAGE.NOT_FOUND });
      await CardModel.updateOne(
        { _id },
        { $pull: { members: new ObjectId(String(Member._id)) } }
      );
      card = await CardModel.findOne({ _id });
      //add to log
      var action = `Remove ${memberName} from this task`;
      const l = new LogCardModel({ action, cardId: card._id, ownerId: idUserRemove });
      await l.save();
      //
      res.send({
        status: MESSAGE.DELETE_MEMBER_OK,
        card
      });
    } catch (error) {
      res.send({
        status: error
      });
    }
  })();
});

// drag card to other list
router.post('/move', (req, res) => {
  var { _id, newListId, idUserMove } = req.body;
  (async () => {
    try {
      const personMove = await UserModel.findOne({ _id: idUserMove });
      var card = await CardModel.findOne({ _id });
      const newList = await ListModel.findOne({ _id: newListId });
      const oldList = await ListModel.findOne({ _id: card.listId });

      if (!personMove || !card) res.send({ status: MESSAGE.NOT_FOUND });
      else {
        var action = `${personMove.username} moved task "${card.title}" from ${oldList.name} to ${newList.name}`;
        await CardModel.updateOne(
          { _id },
          { $set: { listId: new ObjectId(String(newListId)) } }
        );
        card = await CardModel.findOne({ _id });
        //add to log
        const l = new LogCardModel({ action, cardId: card._id, ownerId: idUserMove });
        await l.save();
        //
        res.send({
          status: MESSAGE.MOVE_CARD_OK,
          card
        });
      }
    } catch (error) {
      res.send({
        status: error
      });
    }
  })();
});

//query get all comment,logs of card by id card
router.get('/:_id/comments', (req, res) => {
  var { _id } = req.params;
  (async () => {
    try {
      var thisCard = await CardModel.find({ _id }).populate(
        'ownerId',
        'username imageUrl'
      );
      thisCard = thisCard[0];
      var comments = await CommentModel.find({ cardId: _id })
        .populate('ownerId', 'username imageUrl')
        .sort({ dateCreate: -1 });
      thisCard.comments = comments;

      var logCards = await LogCardModel.find({ cardId: _id })
        .populate('ownerId', 'username imageUrl')
        .sort({ dateCreate: -1 });
      thisCard.logs = logCards;

      var members = [];
      for (let m of thisCard.members) {
        let t = await UserModel.find({ _id: m }, { username: 1, imageUrl: 1 });
        members.push(t[0]);
      }
      thisCard.members = members;
      res.send({
        status: MESSAGE.QUERY_OK,
        thisCard
      });
    } catch (error) {
      res.send({
        status: error
      });
    }
  })();
});
export default router;
