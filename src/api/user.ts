import * as express from 'express';

import * as MESSAGE from '@/utils/return_message';
import { UserModel, BoardModel } from '@/models';

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

//get user by id
router.get('/:_id', (req, res) => {
  const { _id } = req.params;
  (async () => {
    const user = await UserModel.find({ _id }, { password: 0 });
    res.send({ status: MESSAGE.QUERY_OK, user });
  })();
});


// api delete by _id
router.delete('/:_id', (req, res) => {
  var { _id } = req.params;
  (async () => {
    const user = await UserModel.deleteOne({ _id });
    //also delete all board of this card
    await BoardModel.deleteMany({ ownerId: _id });
    res.send({ status: MESSAGE.DELETE_USER_OK, user });
  })();
});


router.post('/login', (req, res) => {
  const { username, password } = req.body;
  (async () => {
    const user = await UserModel.findOne({ username });
    if (username === user.username && password === user.password) {
      user['password'] = null;
      res.send({
        status: MESSAGE.LOGIN_OK,
        user
      });
    } else {
      res.send({ status: MESSAGE.USER_INCORRECT });
    }
  })();
});

router.post('/register', (req, res) => {
  const { username, password, role, imageUrl } = req.body;
  (async () => {
    var existUser = await UserModel.findOne({ username });
    if (existUser !== null)
      res.send({
        status: MESSAGE.USER_EXIST
      });
    else {
      const u = new UserModel({ username, password, imageUrl });
      var user = await u.save();
      user['password'] = null; //don't send pass
      res.send({
        status: MESSAGE.REGISTER_OK,
        user
      });
    }
  })();
});

router.post('/change-pass', (req, res) => {
  const { username, password, newPassword } = req.body;
  (async () => {
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
  })();
});

//update info user : role , imageURL
router.post('/edit', (req, res) => {
  // field is null or undefinded  => will not update
  const { username, password, imageUrl, role } = req.body;
  var user;
  (async () => {
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
  })();
});

//get all board of user with id=_id
router.get('/:_id/boards', (req, res) => {
  var { _id } = req.params;
  (async () => {
    var boards = await BoardModel.find(
      { ownerId: _id },
      { name: 1, background: 1 }
    );
    res.send({
      status: MESSAGE.QUERY_OK,
      boards
    });
  })();
});

export default router;
