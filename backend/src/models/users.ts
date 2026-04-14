import { Schema, model } from 'mongoose';

const enum Plan {
    Basic = 'basic',
    Plus = 'plus',
    Pro = 'pro'
}

export interface IUser {
  name?: string;
  email: string;
  password: string;
}

const userSchema = new Schema<IUser>({
  name: { type: String },
  email: { type: String, required: true },
  password: {
    type: String,
    required: true
  }
});


export const User = model<IUser>('User', userSchema);
