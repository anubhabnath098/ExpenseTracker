import express from 'express';
const budgetRoute = express.Router();
import {getAllBudget,getBudgetById,addBudget,updateBudget, deleteBudgetById, getBudgetSummaryByCategory, getTotalBudget, getRemainingBudget, getUnreadNotifications, getRecentNotifications, markNotificationAsRead} from '../controllers/budgetController.js';
import {authMiddleware} from '../middlewares/authMiddleware.js';


budgetRoute.get('/all/:userid',authMiddleware,getAllBudget);
budgetRoute.post('/add',authMiddleware,addBudget);
budgetRoute.put('/update/:id',authMiddleware,updateBudget);
budgetRoute.delete('/delete/:id', authMiddleware, deleteBudgetById);
budgetRoute.get('/summary/:userid',authMiddleware, getBudgetSummaryByCategory)
budgetRoute.get('/total/:userid',authMiddleware,getTotalBudget)
budgetRoute.get('/remaining/:userid',authMiddleware, getRemainingBudget)
budgetRoute.get('/notifications/unread/:user_id', authMiddleware,getUnreadNotifications);
budgetRoute.get('/notifications/recent/:user_id', authMiddleware,getRecentNotifications);
budgetRoute.post('/notifications/read',authMiddleware, markNotificationAsRead)
budgetRoute.get('/:id',authMiddleware,getBudgetById);

export default budgetRoute