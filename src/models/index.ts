import Board from '@/models/Board';
import Card from '@/models/Card';
import Comment from '@/models/Comment';
import List from '@/models/List';
import User from '@/models/User';
import LogCard from '@/models/LogCard';
import Log from '@/models/Log';

const BoardModel = new Board().getModelForClass(Board);
const CardModel = new Card().getModelForClass(Card);
const CommentModel = new Comment().getModelForClass(Comment);
const ListModel = new List().getModelForClass(List);
const UserModel = new User().getModelForClass(User);
const LogCardModel = new LogCard().getModelForClass(LogCard);
const LogModel = new Log().getModelForClass(Log);

export { BoardModel, CardModel, CommentModel, ListModel, UserModel,LogCardModel, LogModel};
