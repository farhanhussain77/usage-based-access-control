import mongoose from "mongoose";
import { User } from "../models/users.ts";
import dotenv from 'dotenv';

dotenv.config();
const connectionString = process.env.DB_CONNECTION!;
// 1. Connect DB (if not already connected in your app)
const run = async () => {
    try {
        await mongoose.connect(connectionString);

        console.log("DB connected");

        // 2. Fetch users safely (NO TYPES - avoid TS issues completely)
        const users = await User.find({
            $or: [
                { name: { $exists: false } },
                { name: null },
                { name: "" }
            ]
        }).lean();

        console.log(`Found ${users.length} users to update`);

        // 3. Loop safely (no TypeScript inference issues)
        for (const user of users as any[]) {
            if (!user || !user.email) continue;

            const generatedName = user.email
                .split("@")[0]
                .replace(/[._-]/g, " ")
                .replace(/\b\w/g, (c: string) => c.toUpperCase());

            await User.updateOne(
                { _id: user._id },
                { $set: { name: generatedName } }
            );

            console.log(`Updated: ${user.email} → ${generatedName}`);
        }

        console.log("Migration completed successfully");

        await mongoose.disconnect();
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
};

run();