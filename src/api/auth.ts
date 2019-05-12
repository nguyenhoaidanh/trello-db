import * as express from 'express'; 

import * as MESSAGE from '@/utils/return_message';
import {
  BoardModel, 
  UserModel, 
} from '@/models';
 
const router = express.Router(); 

router.get('/me', (req, res) => {
  const { authorization: raw_token} = req.headers;
  const id = raw_token.split('Bearer ')[1];
  (async () => {
    try {
      const user = await UserModel.findOne({_id:id});
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
