import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { connectToDb } from '../db.js';
import { otpStore } from '../utils/otpStore.js';
import { sendOtpEmail } from '../utils/sendEmail.js';

const JWT_SECRET = process.env.JWT_SECRET_KEY;
  
export const userSignUp = async (req, res) => {
  const { name, email, password, phone_number, role = 'user' } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (otpStore[email] !== "VERIFIED") {
    return res.status(403).json({ message: "OTP not verified." });
  }

  let connection;
  try {
    connection = await connectToDb();

    // Check if user already exists
    const [existing] = await connection.execute(`SELECT * FROM Users WHERE email = ?`, [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "User already exists." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    // Insert new user
    const insertSql = `
      INSERT INTO Users (user_id, name, email, password_hash, phone_number, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await connection.execute(insertSql, [userId, name, email, hashedPassword, phone_number, role]);

    delete otpStore[email];

    return res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    console.error("Error during registration:", err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  } finally {
    if (connection) await connection.end();
  }
};

export async function userSignIn(req, res) {
  let connection;
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    connection = await connectToDb();
    const selectSql = `SELECT * FROM Users WHERE email = ?`;
    const [rows] = await connection.execute(selectSql, [email]);
    await connection.end();

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const payload = { user_id: user.user_id, email: user.email, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '10h' });

    res.cookie('token', token, { httpOnly: true });
    // localStorage.setItem("token", res.token);
    
    res.json({ message: "Signed in successfully", token, user });
  } catch (err) {
    console.error("Error during signin:", err);
    if (connection) await connection.end();
    res.status(500).json({ error: err.message });
  }
};

export async function getUserDetailsById(req, res) {
  let connection;
  try {
    const userId = req.params.id;
    connection = await connectToDb();
    const sql = `
      SELECT user_id, name, email, phone_number, created_at, role
      FROM Users
      WHERE user_id = ?
    `;
    const [rows] = await connection.execute(sql, [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({ user: rows[0] });
  } catch (err) {
    console.error("Error fetching user details:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
};

export async function getAllUsers(req, res) {
  let connection;
  try {
    connection = await connectToDb();
    const sql = `
      SELECT user_id, name, email, phone_number, created_at, role
      FROM Users
    `;
    const [rows] = await connection.execute(sql);
    
    res.json({ users: rows });
  } catch (err) {
    console.error("Error fetching all users:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
};


export async function sendOtp(req, res) {
  let connection;
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ error: "Email is required" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = otp;

    connection = await connectToDb();

    // Upsert OTP
    const sql = `
      INSERT INTO EmailOtps (email, otp)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE otp = ?, created_at = CURRENT_TIMESTAMP
    `;
    await connection.execute(sql, [email, otp, otp]);

    // Send the OTP via email
    await sendOtpEmail(email, otp);

    res.json({ message: "OTP sent to email" });

  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  } finally {
    if (connection) await connection.end();
  }
}

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const storedOtp = otpStore[email];

  if (!storedOtp || storedOtp !== otp) {
    return res.status(400).json({ message: "Invalid or expired OTP." });
  }

  otpStore[email] = "VERIFIED";

  return res.status(200).json({ message: "OTP verified successfully." });
};
