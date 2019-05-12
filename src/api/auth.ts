import * as express from 'express'; 

import * as MESSAGE from '@/utils/return_message';
import {
  BoardModel, 
  UserModel, LogModel
} from '@/models';
 
const router = express.Router(); 

router.get('/me', (req, res) => {
  const { authorization: raw_token} = req.headers;
  const id = raw_token.split('Bearer ')[1];
  (async () => {
    try {
      const user = await UserModel.findOne({_id:id});
      if(!user)res.send(
        {
          status: MESSAGE.ERROR
        }
      );
      else
      res.send(
        {
          status: MESSAGE.QUERY_OK, user
        }
      );
    } catch (error) {
      res.send(
        {
          status: MESSAGE.ERROR, error
        }
      );
    }
  })();
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  (async () => {
    try {
     
      const user = await UserModel.findOne({ username });
      if (user!=null && username === user.username && password === user.password) {
        user['password'] = null;
        res.send({
          status: MESSAGE.LOGIN_OK,
          user,
          token: user._id
        });
      } else {
        res.send({ status: MESSAGE.USER_INCORRECT });
      }
    } catch (error) {
      res.send({ status: error });
    }
  })();
});


router.post('/register', (req, res) => {
  const { username, password, role, imageUrl, email } = req.body;
  (async () => {
    try {
      var existUser = await UserModel.findOne({ username });
      var existUser1 = await UserModel.findOne({ email });
      if (existUser !== null || existUser1 !== null)
        res.send({
          status: MESSAGE.USER_EXIST
        });
      else {
        const u = new UserModel({ username, password, imageUrl, email });
        var user = await u.save();
        //add to log
        var action = `${username} created account`;
        const l = new LogModel({ action, ownerId: user._id });
        await l.save();
        //
        user['password'] = null; //don't send pass
        console.log(user)
        res.send({
          status: MESSAGE.REGISTER_OK,
          user,
          token: user._id
        });
      }
    } catch (error) {
      res.send({
        status: error
      });
    }
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
