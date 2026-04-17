import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();
const connectionString = process.env.DB_CONNECTION!;

const connectToDB = async () => {
    try {
        mongoose.connect(connectionString);
    } catch (err: any) {
        console.error(err.message);
        process.exit(1);
    }

    const dbConnection = mongoose.connection;
    dbConnection.once("open", (_) => {
        console.log(`Database connected: ${connectionString}`);
    });
    
    dbConnection.on("error", (err) => {
        console.error(`connection error: ${err}`);
    });
}

export default connectToDB;