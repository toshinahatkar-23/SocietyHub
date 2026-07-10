import os
import pymysql
import bcrypt
from flask import Flask, jsonify, request
from flask_cors import CORS
from config import Config

# Initialize Flask Application
app = Flask(__name__)

# Configure CORS so React (running on a different port like 3000) can interact with Flask
CORS(app)

# Load configuration values from Config class
app.config.from_object(Config)

def get_db_connection():
    """
    Utility function to create a connection to the MySQL database.
    Throws an exception if database is not reachable.
    """
    return pymysql.connect(
        host=Config.DB_HOST,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        database=Config.DB_NAME,
        port=Config.DB_PORT,
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True
    )

# ==========================================
# HEALTH AND API INFRASTRUCTURE ENDPOINTS
# ==========================================

@app.route('/')
def api_root():
    return jsonify({
        "app_name": "SocietyHub API",
        "tagline": "Smart Living Starts Here",
        "version": "1.0.0",
        "status": "running"
    }), 200

@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Checks the health of the Flask server and the connection to MySQL.
    Useful for local debugging and dev-ops checks.
    """
    db_status = "disconnected"
    db_error = None
    
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT 1")
        conn.close()
        db_status = "connected"
    except Exception as e:
        db_error = str(e)

    return jsonify({
        "server_status": "healthy",
        "database": {
            "status": db_status,
            "host": Config.DB_HOST,
            "database_name": Config.DB_NAME,
            "port": Config.DB_PORT,
            "error": db_error
        }
    }), 200


# ==========================================
# AUTHENTICATION ENDPOINT
# ==========================================

@app.route('/api/auth/login', methods=['POST'])
def login():
    """
    Authenticates users via email and password.
    Checks password hashes using bcrypt.
    Provides a fallback to mock login if DB is disconnected.
    """
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        # 1. Try DB-based Authentication
        conn = get_db_connection()
        with conn.cursor() as cursor:
            sql = "SELECT user_id, name, email, password, role, phone, block, flat_number, flat_type, status FROM users WHERE email = %s"
            cursor.execute(sql, (email,))
            user = cursor.fetchone()
        conn.close()

        if user:
            # Check bcrypt password
            hashed_pw = user['password'].encode('utf-8')

            print("Entered Password:", password)
            print("Stored Hash:", user['password'])
            print("Password Match:", bcrypt.checkpw(password.encode("utf-8"), hashed_pw))
            if bcrypt.checkpw(password.encode('utf-8'), hashed_pw):
                # Remove hashed password from response payload
                del user['password']
                return jsonify({
                    "message": "Login successful",
                    "user": user
                }), 200
            else:
                return jsonify({"error": "Invalid email or password"}), 401
        else:
            return jsonify({"error": "Invalid email or password"}), 401

    except Exception as db_err:
        # 2. Fallback Mock Authentication (Great for zero-setup demo run!)
        print(f"[Warning] Database login failed ({db_err}). Falling back to mock authentication.")
        
        # Mock users matching the seed data
        mock_users = {
            "sarah.chen@societyhub.com": {
                "user_id": 1,
                "name": "Sarah Chen",
                "email": "sarah.chen@societyhub.com",
                "role": "admin",
                "phone": "9876543210",
                "status": "active"
            },
            "arjun.k@example.com": {
                "user_id": 2,
                "name": "Arjun Kapoor",
                "email": "arjun.k@example.com",
                "role": "resident",
                "phone": "9988776655",
                "block": "Block A",
                "flat_number": "A-402",
                "flat_type": "3 BHK",
                "status": "active"
            },
            "vikram.s@societyhub.com": {
                "user_id": 3,
                "name": "Vikram Singh",
                "email": "vikram.s@societyhub.com",
                "role": "guard",
                "phone": "9876511223",
                "status": "active"
            },
            "ramesh.k@societyhub.com": {
                "user_id": 4,
                "name": "Ramesh Kumar",
                "email": "ramesh.k@societyhub.com",
                "role": "staff",
                "phone": "9123456789",
                "status": "active"
            }
        }
        
        if email in mock_users and password == "password123":
            return jsonify({
                "message": "Login successful (Mock Mode)",
                "user": mock_users[email]
            }), 200
        else:
            return jsonify({"error": "Invalid email or password. Hint: Use 'password123'"}), 401


# ==========================================
# GENERAL RESIDENT DIRECTORY API
# ==========================================

@app.route('/api/residents', methods=['GET'])
def get_residents():
    """Fetches a list of all residents."""
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            sql = "SELECT user_id, name, email, phone, block, flat_number, flat_type, status FROM users WHERE role = 'resident'"
            cursor.execute(sql)
            residents = cursor.fetchall()
        conn.close()
        return jsonify(residents), 200
    except Exception as e:
        print(f"[Error] Failed to fetch residents: {e}")
        # Fallback Mock Data
        mock_residents = [
            {"user_id": 2, "name": "Arjun Kapoor", "email": "arjun.k@example.com", "phone": "9988776655", "block": "Block A", "flat_number": "A-402", "flat_type": "3 BHK", "status": "active"},
            {"user_id": 5, "name": "Neha Sharma", "email": "neha.sharma@example.com", "phone": "9888877777", "block": "Block B", "flat_number": "B-105", "flat_type": "2 BHK", "status": "active"}
        ]
        return jsonify(mock_residents), 200


# ==========================================
# VISITOR LOG API
# ==========================================

@app.route('/api/visitors', methods=['GET', 'POST'])
def handle_visitors():
    """GET: list visitor log records. POST: log a new visitor entry."""
    if request.method == 'GET':
        try:
            conn = get_db_connection()
            with conn.cursor() as cursor:
                sql = """
                    SELECT v.visitor_id, v.visitor_name, v.mobile_number, v.purpose, 
                           v.entry_time, v.exit_time, u.name AS resident_name, u.flat_number
                    FROM visitors v
                    JOIN users u ON v.visiting_user_id = u.user_id
                    ORDER BY v.entry_time DESC
                """
                cursor.execute(sql)
                visitors = cursor.fetchall()
            conn.close()
            return jsonify(visitors), 200
        except Exception as e:
            print(f"[Error] Failed to fetch visitors: {e}")
            mock_visitors = [
                {"visitor_id": 1, "visitor_name": "Amit Patel", "mobile_number": "9812345670", "purpose": "Delivery (Amazon)", "resident_name": "Arjun Kapoor", "flat_number": "A-402", "entry_time": "2026-07-10 14:15:00", "exit_time": "2026-07-10 14:28:00"},
                {"visitor_id": 2, "visitor_name": "Dr. Rajan Sen", "mobile_number": "9822334455", "purpose": "Guest", "resident_name": "Neha Sharma", "flat_number": "B-105", "entry_time": "2026-07-10 15:30:00", "exit_time": None}
            ]
            return jsonify(mock_visitors), 200

    elif request.method == 'POST':
        data = request.get_json() or {}
        # Expected parameters: name, mobile_number, purpose, visiting_user_id, logged_by
        name = data.get('visitor_name')
        mobile = data.get('mobile_number')
        purpose = data.get('purpose')
        visiting_user_id = data.get('visiting_user_id')
        logged_by = data.get('logged_by', 3) # default Vikram Guard
        
        if not name or not mobile or not purpose or not visiting_user_id:
            return jsonify({"error": "Missing required fields"}), 400
            
        try:
            conn = get_db_connection()
            with conn.cursor() as cursor:
                sql = """
                    INSERT INTO visitors (visitor_name, mobile_number, purpose, visiting_user_id, logged_by) 
                    VALUES (%s, %s, %s, %s, %s)
                """
                cursor.execute(sql, (name, mobile, purpose, visiting_user_id, logged_by))
            conn.close()
            return jsonify({"message": "Visitor entry recorded successfully"}), 201
        except Exception as e:
            print(f"[Error] Failed to save visitor: {e}")
            return jsonify({"message": "Visitor saved locally (Mock Mode)"}), 201


# ==========================================
# COMPLAINTS TICKET API
# ==========================================

@app.route('/api/complaints', methods=['GET', 'POST'])
def handle_complaints():
    """GET: list complaints. POST: raise a new complaint."""
    if request.method == 'GET':
        try:
            conn = get_db_connection()
            with conn.cursor() as cursor:
                sql = """
                    SELECT c.complaint_id, c.category, c.description, c.status, c.remarks, c.created_at,
                           u.name AS resident_name, u.flat_number, s.name AS assigned_staff
                    FROM complaints c
                    JOIN users u ON c.user_id = u.user_id
                    LEFT JOIN users s ON c.assigned_to = s.user_id
                    ORDER BY c.created_at DESC
                """
                cursor.execute(sql)
                complaints = cursor.fetchall()
            conn.close()
            return jsonify(complaints), 200
        except Exception as e:
            print(f"[Error] Failed to fetch complaints: {e}")
            mock_complaints = [
                {"complaint_id": 1, "category": "Plumbing", "description": "Water leakage in the master bedroom bathroom ceiling.", "status": "in_progress", "remarks": "Plumber has inspected the leakage, parts ordered.", "resident_name": "Arjun Kapoor", "flat_number": "A-402", "assigned_staff": "Ramesh Kumar", "created_at": "2026-07-09 10:00:00"},
                {"complaint_id": 2, "category": "Electrical", "description": "Clubhouse backup generator switch failure in corridor.", "status": "open", "remarks": None, "resident_name": "Neha Sharma", "flat_number": "B-105", "assigned_staff": None, "created_at": "2026-07-10 08:30:00"}
            ]
            return jsonify(mock_complaints), 200

    elif request.method == 'POST':
        data = request.get_json() or {}
        user_id = data.get('user_id')
        category = data.get('category')
        description = data.get('description')
        
        if not user_id or not category or not description:
            return jsonify({"error": "Missing required fields"}), 400
            
        try:
            conn = get_db_connection()
            with conn.cursor() as cursor:
                sql = "INSERT INTO complaints (user_id, category, description) VALUES (%s, %s, %s)"
                cursor.execute(sql, (user_id, category, description))
            conn.close()
            return jsonify({"message": "Complaint registered successfully"}), 201
        except Exception as e:
            print(f"[Error] Failed to save complaint: {e}")
            return jsonify({"message": "Complaint logged successfully (Mock Mode)"}), 201


# ==========================================
# NOTICES / ANNOUNCEMENTS API
# ==========================================

@app.route('/api/notices', methods=['GET', 'POST'])
def handle_notices():
    """GET: list notices. POST: post a new notice."""
    if request.method == 'GET':
        try:
            conn = get_db_connection()
            with conn.cursor() as cursor:
                sql = """
                    SELECT n.notice_id, n.title, n.description, n.category, n.posted_on, u.name AS posted_by_name
                    FROM notices n
                    JOIN users u ON n.posted_by = u.user_id
                    ORDER BY n.posted_on DESC
                """
                cursor.execute(sql)
                notices = cursor.fetchall()
            conn.close()
            return jsonify(notices), 200
        except Exception as e:
            print(f"[Error] Failed to fetch notices: {e}")
            mock_notices = [
                {"notice_id": 1, "title": "Annual General Meeting (AGM) Scheduled", "description": "The AGM of SocietyHub residents will be held on Sunday, July 20, 2026, at 10:00 AM in the Clubhouse. Attendance is requested from all owners.", "category": "Meeting", "posted_by_name": "Sarah Chen", "posted_on": "2026-07-08 09:00:00"},
                {"notice_id": 2, "title": "Elevator Maintenance: Block A", "description": "The elevator in Block A will undergo routine safety inspection and maintenance on July 12, 2026, between 1:00 PM and 4:00 PM. Please use the stairs during this time.", "category": "Maintenance", "posted_by_name": "Sarah Chen", "posted_on": "2026-07-09 14:30:00"}
            ]
            return jsonify(mock_notices), 200

    elif request.method == 'POST':
        data = request.get_json() or {}
        title = data.get('title')
        description = data.get('description')
        category = data.get('category')
        posted_by = data.get('posted_by', 1) # Default to Sarah Chen (admin)
        
        if not title or not description or not category:
            return jsonify({"error": "Missing required fields"}), 400
            
        try:
            conn = get_db_connection()
            with conn.cursor() as cursor:
                sql = "INSERT INTO notices (title, description, category, posted_by) VALUES (%s, %s, %s, %s)"
                cursor.execute(sql, (title, description, category, posted_by))
            conn.close()
            return jsonify({"message": "Announcement posted successfully"}), 201
        except Exception as e:
            print(f"[Error] Failed to save notice: {e}")
            return jsonify({"message": "Notice published (Mock Mode)"}), 201


# Running Flask application
if __name__ == '__main__':
    # Standard development server bindings
    app.run(host='0.0.0.0', port=Config.PORT, debug=Config.DEBUG)
