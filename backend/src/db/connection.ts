import { MongoClient } from "mongodb";
import dotenv from 'dotenv';

dotenv.config();
const connectionString = process.env.DB_CONNECTION!;

const connectToDB = async () => {
    console.log("connectionString", connectionString);
    const client = new MongoClient(connectionString);
    let conn;
    try {
        conn = await client.connect();
    } catch(e) {
        console.error(e);
    }
}

export default connectToDB;