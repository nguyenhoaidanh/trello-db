import * as express from 'express';

import * as MESSAGE from '@/utils/return_message';
import { CommentModel, UserModel } from '@/models';

const router = express.Router();

// API for testing
//show all comment,just for test
router.get('/', (req, res) => {
  (async () => {
    const comment = await CommentModel.find({}); //WHY NOT SHOW REF
    res.send(comment);
  })();
});
//end API for test ///////////////////////////////

//get comment by id
router.get('/:_id', (req, res) => {
  const { _id } = req.params;
  (async () => {
    try {
      const comment = await CommentModel.find({ _id });
      if (!comment) res.send({ status: MESSAGE.NOT_FOUND });
      else res.send({ status: MESSAGE.QUERY_OK, comment });
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
      var personRemove = UserModel.findOne({ _id: idUserRemove });
      var comment = await CommentModel.findOne({ _id });

      if (!comment || !personRemove) res.send({ status: MESSAGE.NOT_FOUND });
      else if (String(comment.ownerId) !== idUserRemove) res.send({ status: MESSAGE.NOT_PERMITION });
      else {
        comment = await CommentModel.deleteOne({ _id });
        res.send({
          status: MESSAGE.DELETE_COMMENT_OK, comment
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
  var { content, ownerId, cardId, fileUrl } = req.body;
  (async () => {
    try {
      if (!ownerId || !cardId) res.send({ status: MESSAGE.SOMETHING_REQUIRED });
      else {
        var obj = {};
        if (fileUrl !== null && fileUrl !== undefined) obj['fileUrl'] = fileUrl;
        obj['content'] = content;
        obj['ownerId'] = ownerId;
        obj['cardId'] = cardId;
        const c = new CommentModel(obj);
        var comment = await c.save();
        comment = await CommentModel.findOne({ _id: comment._id });
        res.send({
          status: MESSAGE.ADD_COMMENT_OK,
          comment
        });
      }
    } catch (error) {
      res.send({
        status: error
      });
    }
  })();
});

//update info comment: content, fileUrl
router.post('/edit', (req, res) => {
  const { _id, content, fileUrl, idUserEdit } = req.body;
  var existcomment;
  (async () => {
    try {
      var userEdit = UserModel.findOne({ _id: idUserEdit });
      existcomment = await CommentModel.findOne({ _id });
      if (existcomment === null || userEdit === null) res.send({ status: MESSAGE.NOT_FOUND });
      else {
        if (String(existcomment.ownerId) !== idUserEdit) res.send({ status: MESSAGE.NOT_PERMITION });
        else {
          var obj = {};
          //field which was modified will update, else not update
          if (content !== null && content !== undefined) obj['content'] = content;
          if (fileUrl !== null && fileUrl !== undefined) obj['fileUrl'] = fileUrl;
          await CommentModel.update({ _id }, { $set: obj });
          const comment = await CommentModel.findOne({ _id });
          res.send({
            status: MESSAGE.EDIT_COMMENT_OK,
            comment
          });
        }
      }
    } catch (error) {
      res.send({
        status: error
      });
    }
  })();
});

export default router;
