# SocietyHub – Smart Living Starts Here

Welcome to **SocietyHub**, a professional full-stack responsive residential society management system. This application helps housing societies digitize their day-to-day operations including visitor logging, complaints tracking, monthly maintenance billing, and announcements.

---

## Project Structure

The project is structured into separate folders for frontend and backend components following clean, scalable practices:

```text
societyhub/
├── README.md             <- This guide
├── frontend/             <- React + TypeScript client (Vite, Tailwind CSS)
│   ├── src/              <- React source code (components, context, types)
│   ├── package.json      <- Frontend scripts and dependencies
│   ├── vite.config.ts    <- Vite server configuration
│   └── tsconfig.json     <- TypeScript compiler settings
│
└── backend/              <- Python + Flask server (REST API, PyMySQL connector)
    ├── app.py            <- Server entry point & API endpoints
    ├── config.py         <- Environment configurations loader
    ├── requirements.txt  <- Python dependencies
    └── schema.sql        <- MySQL Database Schema & seed data
```

---

## 1. Frontend Setup (React + TypeScript + Vite)

The frontend is built using React with TypeScript, bundled by Vite, and styled with Tailwind CSS.

### Prerequisites
- **Node.js** (v18 or higher recommended)

### Installation & Launch
1. Navigate into the frontend folder:
   ```bash
   cd frontend
   ```
2. Install the node packages:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   The application will be active locally at `http://localhost:3000`.

---

## 2. Backend Setup (Python + Flask + MySQL)

The backend is a Flask API configured to communicate with a MySQL database.

### Prerequisites
- **Python 3.8+**
- **MySQL Server** (running locally or remotely)

### Installation & Launch
1. Navigate into the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   # On Windows (Command Prompt/PowerShell)
   python -m venv .venv
   .venv\Scripts\activate

   # On macOS/Linux
   python3 -m venv .venv
   source .venv/bin/activate
   ```
3. Install package dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the environment template and fill in your database credentials in the newly created `.env` file:
   ```bash
   copy .env.example .env    # On Windows
   cp .env.example .env      # On macOS/Linux
   ```
5. Import the database schema and seed data into your MySQL server:
   ```bash
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS societyhub;"
   mysql -u root -p societyhub < schema.sql
   ```
6. Run the Flask application:
   ```bash
   python app.py
   ```
   The Flask backend server will spin up on `http://localhost:5000`.

---

## Database Design

The system runs on 6 cohesive MySQL tables defined in `backend/schema.sql`:
1. **`users`**: Manages logins and profiles for Admins, Residents, Guards, and Staff.
2. **`visitors`**: Interactive security gate visitor tracking log.
3. **`complaints`**: Ticket routing for plumbing, electricity, and maintenance problems.
4. **`maintenance_bills`**: Ledger logging payment modes, check numbers, and bills per flat.
5. **`notices`**: Notice board feed for announcements.
6. **`activity_logs`**: System audit trail reflecting administrator actions.

*Note: For ease of testing, the backend will automatically fallback to secure Mock Data if the MySQL server credentials are not yet configured in `.env`.*
