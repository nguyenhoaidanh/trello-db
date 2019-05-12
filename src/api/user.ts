import * as express from 'express';

import * as MESSAGE from '@/utils/return_message';
import { UserModel, BoardModel, LogModel } from '@/models';

const router = express.Router();

// //////////API for testing   , remove later /////////
//show all user,just for test
router.get('/', (req, res) => {
  (async () => {
    const user = await UserModel.find({});
    res.send(user);
  })();
});
//////////   end API for test  ////////




// api delete by _id
router.delete('/:_id', (req, res) => {
  var { _id } = req.params;
  (async () => {
    try {
      const user = await UserModel.findOne({ _id });
      if (!user) res.send({ status: MESSAGE.NOT_FOUND });
      else {
        var resp = await UserModel.deleteOne({ _id });
        //also delete all board of this card
        await BoardModel.deleteMany({ ownerId: _id });
        //add to log
        var action = `User "${user.username}" deleted account`;
        const l = new LogModel({ action, ownerId: _id });
        await l.save();
        //
        res.send({ status: MESSAGE.DELETE_USER_OK, resp });
      }
    } catch (error) {
      res.send({ status: error });
    }
  })();
});


router.get('/usernames', (req, res) => {
  (async () => {
    try {
      const usernames = await UserModel.find({},{imageUrl:1,username:1});
      res.send(
        { status: MESSAGE.QUERY_OK, usernames }
      );
    } catch (error) {
      res.send({ status: error });
    }

  })();
});

//get user by id
router.get('/:_id', (req, res) => {
  const { _id } = req.params;
  (async () => {
    try {
      const user = await UserModel.find({ _id }, { password: 0 });
      res.send({ status: MESSAGE.QUERY_OK, user });
    } catch (error) {
      res.send({ status: error });
    }
  })();
});



router.post('/change-pass', (req, res) => {
  const { username, password, newPassword } = req.body;
  (async () => {
    try {
      var existUser = await UserModel.findOne({ username });
      if (existUser === null || existUser.password != password)
        res.send({
          status: MESSAGE.USER_INCORRECT
        });
      else {
        const user = await UserModel.update(
          { username },
          { $set: { password: newPassword } }
        );
        res.send({
          status: MESSAGE.CHANGE_PASS_OK,
          user
        });
      }
    } catch (error) {
      res.send({
        status: error
      });
    }
  })();
});


router.post('/reset-pass', (req, res) => {
  const { email, password } = req.body;
  (async () => {
    try {
      var existUser = await UserModel.findOne({ email });
      if (existUser === null)
        res.send({
          status: MESSAGE.EMAIL_INCORRECT
        });
      else {
        const user = await UserModel.update(
          { email },
          { $set: { password: password } }
        );
        res.send({
          status: MESSAGE.CHANGE_PASS_OK,
          user
        });
      }
    } catch (error) {
      res.send({
        status: error
      });
    }
  })();
});

//update info user : role , imageURL
router.post('/edit', (req, res) => {
  // field is null or undefinded  => will not update
  const { username, password, imageUrl, role } = req.body;
  var user;
  (async () => {
    try {
      user = await UserModel.findOne({ username });
      if (user === null || user.password != password)
        res.send({ status: MESSAGE.USER_INCORRECT });
      else {
        var obj = {};
        //field which was modified will update, else not update
        if (imageUrl !== null || imageUrl !== undefined)
          obj['imageUrl'] = imageUrl;
        if (role !== null || role !== undefined) obj['role'] = role;
        await UserModel.update({ username }, { $set: obj });
        user = await UserModel.findOne({ username }, { password: 0 });
        res.send({
          status: MESSAGE.UPDATE_USER_OK,
          user
        });
      }
    } catch (error) {
      res.send({
        status: error
      });
    }
  })();
});

//get all board of user with id=_id || or borad user is member of
router.get('/:_id/boards', (req, res) => {
  var { _id } = req.params;
  (async () => {
    try {
      var boards=[];
      var allBoards = await BoardModel.find({});
      for(var x of allBoards)
      {
        if(x.ownerId==_id){boards.push(x); continue}
        for(var y of x.members)
        {
          if(_id==y._id)boards.push(x);
        }
      }
      res.send({
        status: MESSAGE.QUERY_OK,
        boards
      });
    } catch (error) {
      res.send({
        error
      });
    }
  })();
});

export default router;
