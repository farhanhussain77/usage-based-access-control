import { Schema, model } from 'mongoose';

export interface IUser {
  _id: string;
  name?: string;
  email: string;
  password: string;
  stripe_customer_id?: string;
}

const userSchema = new Schema<IUser>({
  name: { type: String },
  email: { type: String, required: true },
  password: {
    type: String,
    required: true
  },
  stripe_customer_id: {
    type: String,
    required: false
  }
});


export const User = model<IUser>('User', userSchema);
