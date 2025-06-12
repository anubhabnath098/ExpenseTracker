import express from 'express';
const authRoute = express.Router();
import {userSignUp,userSignIn, getUserDetailsById, getAllUsers, sendOtp, verifyOtp} from '../controllers/authController.js';
import {adminMiddleware, authMiddleware} from '../middlewares/authMiddleware.js';

authRoute.post('/sign-up',userSignUp);
authRoute.post('/sign-in',userSignIn);
authRoute.post('/send-otp', sendOtp);
authRoute.post('/verify-otp', verifyOtp);
authRoute.get('/users', adminMiddleware,getAllUsers)
authRoute.get('/users/:id',authMiddleware,getUserDetailsById)

export default authRoute; 