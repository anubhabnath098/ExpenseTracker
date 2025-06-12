import express from "express";
import {
    getUserDetails,
    updateUserProfile,
    sendEmailUpdateOtp,
    verifyEmailUpdateOtp
  } from '../controllers/userController.js';  
import { authMiddleware } from '../middlewares/authMiddleware.js';

const userRoute = express.Router();

userRoute.get("/me", authMiddleware, getUserDetails);
userRoute.put("/update", authMiddleware, updateUserProfile);
userRoute.post("/send-email-update-otp", sendEmailUpdateOtp);
userRoute.post("/verify-email-update-otp", verifyEmailUpdateOtp);

export default userRoute;
