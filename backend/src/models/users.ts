import { Schema, model, type ObjectId } from 'mongoose';

export type UserRole = "customer" | "admin" | "superadmin";

export interface IUser {
  _id: string;
  name?: string;
  email: string;
  password: string;
  stripe_customer_id?: string;
  role: UserRole;
  team_id?: ObjectId | null
}

const userSchema = new Schema<IUser>({
  name: { type: String },
  email: { type: String, required: true, unique: true, },
  password: {
    type: String,
    required: true
  },
  stripe_customer_id: {
    type: String,
    required: false
  },
  role: {
    type: String,
    enum: ["customer", "admin", "superadmin"],
    default: "customer"
  },
  team_id: {
    type: Schema.Types.ObjectId,
    ref: "Team",
    default: null
}
});


export const User = model<IUser>('User', userSchema);
