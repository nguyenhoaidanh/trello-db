import { prop, Ref, Typegoose, ModelType, InstanceType } from 'typegoose';

import User from '@/models/User';

export default class Board extends Typegoose {
  @prop({ required: true })
  name: string;

  @prop({ ref: User, required: true })
  ownerId: Ref<User>;

  @prop({ required: true, default: true })
  modeView: boolean; //true: public | false: privated

  @prop()
  background?: string;

  @prop({ required: true, default: [] })
  members: Object[];

  @prop({ default: [] })
  lists: Object[];

  @prop({ required: true, default: Date.now() })
  dateCreated: Date;
}
