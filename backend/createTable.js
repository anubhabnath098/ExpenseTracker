import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectToDb } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeTables() {
  let connection;
  try {
    connection = await connectToDb();
    const sqlFilePath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf-8');

    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log("Initializing tables...");
    for (const statement of statements) {
      await connection.execute(statement);
    }

    console.log("Tables initialized successfully.");
  } catch (err) {
    console.error("Error initializing tables:", err);
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

initializeTables();
