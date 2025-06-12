CREATE TABLE Users (
    user_id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Expense_Types (
    type_id VARCHAR(100) PRIMARY KEY,
    type_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE Expenses (
    expense_id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    description VARCHAR(100) NOT NULL,
    type_id VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    expense_date DATE NOT NULL,
    notes TEXT,
    CONSTRAINT fk_expenses_user FOREIGN KEY (user_id) REFERENCES Users (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_expenses_type FOREIGN KEY (type_id) REFERENCES Expense_Types (type_id) ON DELETE CASCADE
);

CREATE TABLE Budgets (
    budget_id VARCHAR(100) PRIMARY KEY,
    budget_name VARCHAR(100) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    type_id VARCHAR(100) NOT NULL,
    budget_limit DECIMAL(10,2) NOT NULL,
    budget_spent DECIMAL (10,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    notes TEXT,
    CONSTRAINT fk_budgets_user FOREIGN KEY (user_id) REFERENCES Users (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_budgets_type FOREIGN KEY (type_id) REFERENCES Expense_Types (type_id) ON DELETE CASCADE
);

  CREATE TABLE Notifications (
    notification_id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    budget_id VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(10) NOT NULL CHECK (notification_type IN ('warning', 'info')),
    is_read BOOLEAN DEFAULT FALSE,
    notified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES Users (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_budget FOREIGN KEY (budget_id) REFERENCES Budgets(budget_id) ON DELETE CASCADE
);



