import { prop, Ref, Typegoose, ModelType, InstanceType } from 'typegoose';

import Card from '@/models/Card';
import User from '@/models/User';

export default class LogCard extends Typegoose {
  @prop({ required: true })
  action: string;  

  @prop({ ref: Card, required: true })
  cardId: Ref<Card>;

  @prop({ ref: User, required: true })
  ownerId: Ref<User>;

  @prop({ required: true, default: Date.now() })
  dateCreate: Date;
}
