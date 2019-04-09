import Board from '@models/Board';
import Card from '@models/Card';
import Comment from '@models/Comment';
import List from '@models/List';
import User from '@models/User';

const BoardModel = new Board().getModelForClass(Board);
const CardModel = new Card().getModelForClass(Card);
const CommentModel = new Comment().getModelForClass(Comment);
const ListModel = new List().getModelForClass(List);
const UserModel = new User().getModelForClass(User);

export { BoardModel, CardModel, CommentModel, ListModel, UserModel };
