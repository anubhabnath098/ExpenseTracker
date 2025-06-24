import { v4 as uuidv4 } from 'uuid';
import connection from '../db.js';

export async function getAllExpenses(req, res) {

    try {
      // Establish a connection to the database
  
      // Retrieve the user id from the route parameters
      const { userid } = req.params;
  
      const sql = `
        SELECT 
          e.expense_id,
          e.expense_date,
          e.amount,
          e.description,
          e.notes,
          e.budget_id,
          et.type_name
        FROM Expenses e
        JOIN Expense_Types et ON e.type_id = et.type_id
        WHERE e.user_id = ?
      `;
  
      // Execute the query with the userid as a parameter
      const [rows] = await connection.execute(sql, [userid]);
  
      // Transform the rows into the desired response format
      const expenses = rows.map(row => ({
        id: row.expense_id,
        date: new Date(row.expense_date),
        category: row.type_name,        
        description: row.description || "",     
        amount: Number(row.amount),       
        notes: row.notes || "",          
        budget_id: row.budget_id || null                    
      }));
  

      res.json(expenses);
    } catch (err) {
      console.error("Error fetching expenses:", err);
      res.status(500).json({ error: err.message });
    } finally {
      
    }
  }

  export async function getAllBudgetNames(req, res) {
    try{
      const { userid } = req.params;

      const sql = `
        SELECT budget_id, budget_name, start_date, end_date
        FROM Budgets
        WHERE user_id = ?
      `;

      const [rows] = await connection.execute(sql, [userid]);

      // Transform the rows into the desired response format
      const budgets = rows.map(row => ({
        budget_id: row.budget_id,
        budget_name: row.budget_name,
      }));

      return res.json(budgets);
    }catch (err) {
      console.error("Error fetching budget names:", err);
      res.status(500).json({ error: err.message });
    }
  }
  

  export async function getExpenseById(req, res) {

    try {
      
      const { id } = req.params;
  
      // Join Expenses with Expense_Types to get category (type_name)
      const sql = `
        SELECT 
          e.expense_id,
          e.expense_date,
          e.amount,
          e.description,
          e.notes,
          e.budget_id,
          et.type_name
        FROM Expenses e
        JOIN Expense_Types et ON e.type_id = et.type_id
        WHERE e.expense_id = ?
      `;
  
      const [rows] = await connection.execute(sql, [id]);
  
      if (rows.length === 0) {
        return res.status(404).json({ message: "Expense not found" });
      }
  
      const row = rows[0];
  
      const expense = {
        id: row.expense_id,
        date: new Date(row.expense_date),
        category: row.type_name,        
        description: row.description || "",     
        amount: Number(row.amount),       
        notes: row.notes || "",          
        budgetId: row.budget_id || null
      };

  
      res.json({ expense });
    } catch (err) {
      console.error("Error fetching expense:", err);
      res.status(500).json({ error: err.message });
    } finally {
      
    }
  }
  
  


export async function addExpense(req, res) {

  try {
    const { user_id, type_id, amount, expense_date, notes, description, budget_id } = req.body;
    const expense_id = uuidv4();
    // Insert the expense
    const insertSQL = `
      INSERT INTO Expenses (expense_id, user_id, description, type_id, amount, expense_date, notes, budget_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await connection.execute(insertSQL, [
      expense_id,
      user_id,
      description,
      type_id,
      amount,
      expense_date,
      notes,
      budget_id,
    ]);
    if(budget_id){
      const budgetUpdateSQL = `SELECT SUM(amount) as total_spent FROM Expenses WHERE budget_id = ?`;
      const [budgetRows] = await connection.execute(budgetUpdateSQL, [budget_id]);
      const totalSpent = budgetRows[0]?.total_spent || 0;

      // Update the budget's spent amount
      const updateBudgetSQL = `
        UPDATE Budgets
        SET budget_spent = ?
        WHERE budget_id = ?
      `;
      await connection.execute(updateBudgetSQL, [totalSpent, budget_id]);

      const budgetSQL = `SELECT budget_name, budget_limit, budget_spent FROM Budgets WHERE budget_id = ?`;
      const [SelectbudgetRows] = await connection.execute(budgetSQL, [budget_id]);
      const budget_name = SelectbudgetRows[0]?.budget_name || "";
      const budget_limit = parseFloat(SelectbudgetRows[0]?.budget_limit) || 0;
      const budget_spent = parseFloat(SelectbudgetRows[0]?.budget_spent) || 0;

      // Check if notification is needed
      const notificationThreshold = budget_limit * 0.9; // 90% of budget_limit
      if (budget_spent >= notificationThreshold) {
        const notification_id = uuidv4();
        const notification_type = budget_spent >= budget_limit ? 'warning' : 'info';
        const message = budget_spent >= budget_limit 
          ? `Budget "${budget_name}" has exceeded the limit of ${budget_limit}.`
          : `Budget "${budget_name}" has reached 90% of the limit (${budget_limit}).`;

        const notificationSQL = `
          INSERT INTO Notifications (notification_id, user_id, budget_id, message, notification_type, is_read, notified_at)
          VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `;
        await connection.execute(notificationSQL, [notification_id, user_id, budget_id, message, notification_type, false]);
      }
    }

    // Fetch inserted expense with category name
    const fetchSQL = `
      SELECT 
        e.expense_id,
        e.expense_date,
        e.description,
        e.amount,
        e.notes,
        e.budget_id,
        et.type_name
      FROM Expenses e
      JOIN Expense_Types et ON e.type_id = et.type_id
      WHERE e.expense_id = ?
    `;
    const [rows] = await connection.execute(fetchSQL, [expense_id]);

    const row = rows[0];

    const expense = {
      id: row.expense_id,
      date: new Date(row.expense_date),
      description:row.description,
      category: row.type_name,
      description: row.notes || "",
      amount: Number(row.amount),
      notes: row.notes || "",
      budget_id: row.budget_id || null
    };

    return res.status(201).json({ message: "Expense added successfully", expense });
  } catch (err) {
    console.error("Error adding expense:", err);
    return res.status(500).json({ error: err.message });
  } finally {
    
  }
}


export async function updateExpense(req, res) {

    try {

  
      const { id } = req.params;
      const { type_id,description, amount, expense_date, notes, budget_id } = req.body;
      
      // Check if the expense exists
      const checkSQL = `SELECT * FROM Expenses WHERE expense_id = ?`;
      const [checkRows] = await connection.execute(checkSQL, [id]);
      if (checkRows.length === 0) {
        return res.status(404).json({ message: "Expense not found" });
      }

      const previousBudgetId = checkRows[0].budget_id;
      const user_id = checkRows[0].user_id;
      // Update the expense
      const updateSQL = `
        UPDATE Expenses
        SET type_id = ?, amount = ?, expense_date = ?, notes = ?, description = ?, budget_id = ?
        WHERE expense_id = ?
      `;
      const [result] = await connection.execute(updateSQL, [
        type_id,
        amount,
        expense_date,
        notes,
        description,
        budget_id,
        id,
      ]);

      if(budget_id){
        const budgetUpdateSQL = `SELECT SUM(amount) as total_spent FROM Expenses WHERE budget_id = ?`;
        const [budgetRows] = await connection.execute(budgetUpdateSQL, [budget_id]);
        const totalSpent = budgetRows[0]?.total_spent || 0;
        // Update the budget's spent amount
        const updateBudgetSQL = `
          UPDATE Budgets
          SET budget_spent = ?
          WHERE budget_id = ?
        `;
        await connection.execute(updateBudgetSQL, [totalSpent, budget_id]);

        const budgetSQL = `SELECT budget_name, budget_limit, budget_spent FROM Budgets WHERE budget_id = ?`;
        const [SelectbudgetRows] = await connection.execute(budgetSQL, [budget_id]);
        const budget_name = SelectbudgetRows[0]?.budget_name || "";
        const budget_limit = parseFloat(SelectbudgetRows[0]?.budget_limit) || 0;
        const budget_spent = parseFloat(SelectbudgetRows[0]?.budget_spent) || 0;

        // Check if notification is needed
        const notificationThreshold = budget_limit * 0.9; // 90% of budget_limit
        if (budget_spent >= notificationThreshold) {
          const notification_id = uuidv4();
          const notification_type = budget_spent >= budget_limit ? 'warning' : 'info';
          const message = budget_spent >= budget_limit 
            ? `Budget "${budget_name}" has exceeded the limit of ${budget_limit}.`
            : `Budget "${budget_name}" has reached 90% of the limit (${budget_limit}).`;
          const notificationSQL = `
            INSERT INTO Notifications (notification_id, user_id, budget_id, message, notification_type, is_read, notified_at)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          `;
          await connection.execute(notificationSQL, [notification_id, user_id, budget_id, message, notification_type, false]);
        }
      }
      if(previousBudgetId && previousBudgetId !== budget_id) {
        const previousBudgetUpdateSQL = `SELECT SUM(amount) as total_spent FROM Expenses WHERE budget_id = ?`;
        const [previousBudgetRows] = await connection.execute(previousBudgetUpdateSQL, [previousBudgetId]);
        const previousTotalSpent = previousBudgetRows[0]?.total_spent || 0;

        // Update the previous budget's spent amount
        const updatePreviousBudgetSQL = `
          UPDATE Budgets
          SET budget_spent = ?
          WHERE budget_id = ?
        `;
        await connection.execute(updatePreviousBudgetSQL, [previousTotalSpent, previousBudgetId]);
      }
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Expense not found" });
      }
  
      // Fetch the updated expense with category
      const fetchSQL = `
        SELECT 
          e.expense_id,
          e.expense_date,
          e.description,
          e.amount,
          e.notes,
          e.budget_id,
          et.type_name
        FROM Expenses e
        JOIN Expense_Types et ON e.type_id = et.type_id
        WHERE e.expense_id = ?
      `;
      const [rows] = await connection.execute(fetchSQL, [id]);
  
      const row = rows[0];
      const expense = {
        id: row.expense_id,
        date: new Date(row.expense_date),
        category: row.type_name,
        description:row.description,
        description: row.notes || "",
        amount: Number(row.amount),
        notes: row.notes || "",
        budget_id: row.budget_id || null
      };
  
      res.json({ message: "Expense updated successfully", expense });
    } catch (err) {
      console.error("Error updating expense:", err);
      res.status(500).json({ error: err.message });
    } finally {
      
    }
  }


  export async function deleteExpenseById(req, res) {

    try {
      // Establish a connection to the database
  
      // Retrieve the expense id from the route parameters
      const { id } = req.params;
      const checkSQL = `SELECT * FROM Expenses WHERE expense_id = ?`;
      const [checkRows] = await connection.execute(checkSQL, [id]);
      if (checkRows.length === 0) {
        return res.status(404).json({ message: "Expense not found" });
      }
      const previousBudgetId = checkRows[0].budget_id;
      
      // SQL query to delete the expense by expense_id
      const deleteSQL = `
        DELETE FROM Expenses
        WHERE expense_id = ?
      `;
  
      // Execute the delete query
      const [result] = await connection.execute(deleteSQL, [id]);
  
      // Check if any rows were affected; if not, the expense was not found
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Expense not found" });
      }
      if(previousBudgetId) {
        const previousBudgetUpdateSQL = `SELECT SUM(amount) as total_spent FROM Expenses WHERE budget_id = ?`;
        const [previousBudgetRows] = await connection.execute(previousBudgetUpdateSQL, [previousBudgetId]);
        const previousTotalSpent = previousBudgetRows[0]?.total_spent || 0;

        // Update the previous budget's spent amount
        const updatePreviousBudgetSQL = `
          UPDATE Budgets
          SET budget_spent = ?
          WHERE budget_id = ?
        `;
        await connection.execute(updatePreviousBudgetSQL, [previousTotalSpent, previousBudgetId]);
      }
  
      // Return success response
      return res.json({ message: "Expense deleted successfully" });
    } catch (err) {
      console.error("Error deleting expense:", err);
      return res.status(500).json({ error: err.message });
    } finally {
      
    }
  }


  export async function getRecentExpenses(req, res) {
    try {
      // Establish a connection to the database
 
  
      // Retrieve the user id from the route parameters
      const { userid } = req.params;
  
      const sql = `
        SELECT 
          e.expense_id,
          e.expense_date,
          e.amount,
          e.description,
          e.notes,
          e.budget_id,
          et.type_name
        FROM Expenses e
        JOIN Expense_Types et ON e.type_id = et.type_id
        WHERE e.user_id = ?
        ORDER BY e.expense_date DESC
        LIMIT 5
      `;
  
      // Execute the query with the userid as a parameter
      const [rows] = await connection.execute(sql, [userid]);
  
      // Transform the rows into the desired response format
      const expenses = rows.map(row => ({
        id: row.expense_id,
        date: new Date(row.expense_date),
        category: row.type_name,
        description: row.description || "",
        amount: Number(row.amount),
        notes: row.notes || "",
        budgetId: row.budget_id || null
      }));
  
      return res.json(expenses);
    } catch (err) {
      console.error("Error fetching recent expenses:", err);
      return res.status(500).json({ error: err.message });
    } finally {
      
    }
}

export async function getMonthlyExpenses(req, res) {

  try {
    // Establish a connection to the database

    
    // Retrieve the user id from the route parameters
    const { userid } = req.params;

    const sql = `
      SELECT 
        DATE_FORMAT(expense_date, '%b') as month_name,
        SUM(amount) as total_amount
      FROM Expenses
      WHERE user_id = ?
      GROUP BY DATE_FORMAT(expense_date, '%b'), MONTH(expense_date)
      ORDER BY MONTH(expense_date) DESC
    `;

    // Execute the query with the userid as a parameter
    const [rows] = await connection.execute(sql, [userid]);

    // Transform the rows into the desired response format
    const monthlyExpenses = rows.map(row => ({
      name: row.month_name,       // Three-character month name (e.g., "Jan", "Feb")
      expenses: Number(row.total_amount)
    }));

    res.json(monthlyExpenses);
  } catch (err) {
    console.error("Error fetching monthly expenses:", err);
    res.status(500).json({ error: err.message });
  } finally {
    
  }
}

export async function getExpenseCategories(req, res) {

  try {
    // Establish a connection to the database
 
    
    // Retrieve the user id from the route parameters
    const { userid } = req.params;

    const sql = `
      SELECT 
        et.type_name as category_name,
        SUM(e.amount) as total_amount
      FROM Expenses e
      JOIN Expense_Types et ON e.type_id = et.type_id
      WHERE e.user_id = ?
      GROUP BY et.type_name
    `;

    // Execute the query with the userid as a parameter
    const [rows] = await connection.execute(sql, [userid]);

    // Transform the rows into the desired response format
    const categoryExpenses = rows.map(row => ({
      name: row.category_name,
      value: Number(row.total_amount)
    }));

    res.json(categoryExpenses);
  } catch (err) {
    console.error("Error fetching expense categories:", err);
    res.status(500).json({ error: err.message });
  } finally {
    
  }
}


export async function getTotalExpenses(req, res) {

  try {

    const { userid } = req.params;

    const sql = `
      SELECT 
        SUM(amount) as current_month_expenses,
        (SELECT SUM(amount) 
         FROM Expenses 
         WHERE user_id = ? 
         AND DATE_FORMAT(expense_date, '%Y-%m') = DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m')) as last_month_expenses
      FROM Expenses
      WHERE user_id = ?
      AND DATE_FORMAT(expense_date, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m')
    `;
    const [rows] = await connection.execute(sql, [userid, userid]);

    const current = Number(rows[0].current_month_expenses || 0);
    const last = Number(rows[0].last_month_expenses || 0);
    const trendValue = last > 0 ? ((current - last) / last * 100) : (current > 0 ? 100 : 0);
    
    res.json({
      totalExpenses: current,
      trend: {
        value: Math.abs(trendValue).toFixed(1),
        isPositive: current <= last, // Less or equal expenses is positive
      }
    });
  } catch (err) {
    console.error("Error fetching total expenses:", err);
    res.status(500).json({ error: err.message });
  } finally {
    
  }
}

  

  