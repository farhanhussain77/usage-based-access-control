import { Schema, model } from "mongoose";

const webhookEventSchema = new Schema({
    id: { type: Number, autoIncrement: true, primaryKey: true },
    event_id: { type: String, unique: true },
    type: String,
    processed_at: Date
  }, { timestamps: true });
  
  export const WebhookEvent = model("WebhookEvent", webhookEventSchema);