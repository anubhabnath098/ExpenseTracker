import { connectToDb } from '../db.js';
import bcrypt from 'bcrypt';
import { sendOtpEmail } from '../utils/sendEmail.js';

// Get user details
export const getUserDetails = async (req, res) => {
  const { user_id } = req.user;
  let connection;

  try {
    connection = await connectToDb();
    const [rows] = await connection.execute(
      "SELECT user_id, name, email, phone_number FROM Users WHERE user_id = ?",
      [user_id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user data" });
  } finally {
    if (connection) await connection.end();
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  const { user_id } = req.user;
  const { name, email, phone_number, password } = req.body;
  let connection;

  try {
    const updateFields = [];
    const values = [];

    if (name) {
      updateFields.push("name = ?");
      values.push(name);
    }
    if (email) {
      updateFields.push("email = ?");
      values.push(email);
    }
    if (phone_number) {
      updateFields.push("phone_number = ?");
      values.push(phone_number);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push("password_hash = ?");
      values.push(hashedPassword);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    values.push(user_id);

    const sql = `UPDATE Users SET ${updateFields.join(", ")} WHERE user_id = ?`;
    connection = await connectToDb();
    await connection.execute(sql, values);

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update profile" });
  } finally {
    if (connection) await connection.end();
  }
};

// Send OTP to new email
export const sendEmailUpdateOtp = async (req, res) => {
  const { newEmail } = req.body;
  if (!newEmail) return res.status(400).json({ message: "Email required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  let connection;

  try {
    connection = await connectToDb();
    await connection.execute(
      "REPLACE INTO EmailOtps (email, otp) VALUES (?, ?)",
      [newEmail, otp]
    );
    await sendOtpEmail(newEmail, otp);
    res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send OTP" });
  } finally {
    if (connection) await connection.end();
  }
};

// Verify OTP
export const verifyEmailUpdateOtp = async (req, res) => {
  const { newEmail, otp } = req.body;
  if (!newEmail || !otp) return res.status(400).json({ message: "Email and OTP required" });

  let connection;
  try {
    connection = await connectToDb();
    const [rows] = await connection.execute(
      "SELECT * FROM EmailOtps WHERE email = ? AND otp = ?",
      [newEmail, otp]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await connection.execute("DELETE FROM EmailOtps WHERE email = ?", [newEmail]);

    res.json({ message: "OTP verified" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "OTP verification failed" });
  } finally {
    if (connection) await connection.end();
  }
};
