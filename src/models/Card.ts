import { prop, Ref, Typegoose, ModelType, InstanceType } from 'typegoose';

import User from '@/models/User';
import List from '@/models/List';

export default class Card extends Typegoose {
  @prop({ required: true })
  title: string;

  @prop({ ref: User, required: true })
  ownerId: Ref<User>;

  @prop({ required: true, default: false })
  archived: boolean;

  @prop({ ref: List, required: true })
  listId: Ref<List>;

  @prop({ required: true, default: Date.now() })
  dateCreated: Date;

  @prop({  })
  deadline: Date;

  @prop({})
  description: string;

  @prop({ default: [] })
  labels: object[];

  @prop({ required: true  })
  order: number;

  @prop({ required: true, default: [] })
  members: Object[]; //person who assigned task

  @prop({ default: [] })
  comments: Object[];

  @prop({ default: [] })
  logs: Object[];

  @prop({ default: [] })
  fileUrl: String[];
}
