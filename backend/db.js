// db.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const dbConfig = {
  host: process.env.MYSQL_DB_HOST, 
  user: process.env.MYSQL_DB_USER, 
  password: process.env.MYSQL_DB_PASSWORD,
  database: process.env.MYSQL_DB_NAME
};

export async function connectToDb() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log("Connected to MySQL DB!");
    return connection;
  } catch (err) {
    console.error("Error connecting to DB:", err);
    throw err;
  }
}
