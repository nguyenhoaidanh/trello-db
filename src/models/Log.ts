import { prop, Ref, Typegoose, ModelType, InstanceType } from 'typegoose';

import User from '@/models/User';

export default class Log extends Typegoose {
  @prop({ required: true })
  action: string;  

  @prop({})
  object: string; // person action to object

  @prop({ ref: User, required: true })
  ownerId: Ref<User>;

  @prop({ required: true, default: Date.now() })
  dateCreate: Date;
}
