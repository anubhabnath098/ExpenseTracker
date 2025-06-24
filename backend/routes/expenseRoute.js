import express from 'express';
const expenseRoute = express.Router();
import {getAllExpenses,getExpenseById,addExpense,updateExpense,deleteExpenseById, getRecentExpenses, getMonthlyExpenses, getExpenseCategories, getTotalExpenses, getAllBudgetNames} from '../controllers/expenseController.js';
import {authMiddleware} from '../middlewares/authMiddleware.js';


expenseRoute.get('/all/:userid',authMiddleware,getAllExpenses);
expenseRoute.post('/add',authMiddleware,addExpense);
expenseRoute.put('/update/:id',authMiddleware,updateExpense);
expenseRoute.delete('/delete/:id',authMiddleware,deleteExpenseById);
expenseRoute.get('/recent/:userid',authMiddleware,getRecentExpenses)
expenseRoute.get('/monthly/:userid',authMiddleware,getMonthlyExpenses)
expenseRoute.get('/categories/:userid',authMiddleware,getExpenseCategories)
expenseRoute.get('/total/:userid',authMiddleware,getTotalExpenses)
expenseRoute.get('/:id',authMiddleware,getExpenseById);
expenseRoute.get('/budget/all/:userid', authMiddleware, getAllBudgetNames);

export default expenseRoute