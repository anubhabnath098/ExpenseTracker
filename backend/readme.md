# Personal Expense Tracker Backend

## 🚀 Overview
The backend for the **Personal Expense Tracker** is built with **Node.js** and **Express.js**, using **MySQL** for database management. This API allows users to track expenses, manage budgets, and receive notifications.

## 📎 Tech Stack
- **Node.js**
- **Express.js**
- **MySQL** (Using `mysql2` package)
- **JWT Authentication**
- **dotenv** (For environment variables)

## 📌 Setup Instructions

### 1️⃣ Clone the Repository
```sh
git clone https://github.com/anubhabnath098/Personal-Expense-Tracker.git
cd Personal-Expense-Tracker
```

### 2️⃣ Install Dependencies
```sh
npm install
```

### 3️⃣ Configure Environment Variables
Create a `.env` file in the root directory and add the following:
```
PORT=
MYSQL_DB_HOST=
MYSQL_DB_USER=
MYSQL_DB_PASSWORD=
MYSQL_DB_NAME=
JWT_SECRET_KEY=
```

### 4️⃣ Set Up the Database Tables
Run the following command to create necessary SQL tables:
```sh
npm run create-table
```

### 5️⃣ Start the Server
- **Development Mode** (with auto-reload using `nodemon`):
  ```sh
  npm run dev
  ```
- **Production Mode**:
  ```sh
  npm run start
  ```

The server should now be running at `http://localhost:5000` (or your configured port).

## 🔧 API Endpoints
| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/api/auth/sign-up` | Register a new user |
| `POST` | `/api/auth/sign-in` | User login & JWT authentication |
| `GET` | `/api/auth/users/:id` | Fetch user details by ID |
| `GET` | `/api/auth/users` | Fetch All users if you are admin |

## 🤝 Contributing
### Steps to Contribute:
1. **Fork** the repository
2. **Clone** your forked repo:
   ```sh
   git clone https://github.com/your-username/Personal-Expense-Tracker.git
   ```
3. **Create a new branch** for your feature/fix:
   ```sh
   git checkout -b feature-branch-name
   ```
4. **Make your changes & commit**:
   ```sh
   git add .
   git commit -m "Your descriptive commit message"
   ```
5. **Push to your forked repo**:
   ```sh
   git push origin feature-branch-name
   ```
6. **Create a Pull Request (PR)** on the main repository.

## 📝 License
This project is **open-source** and available under the **MIT License**.

---

🚀 **Happy Coding!** 🎉

