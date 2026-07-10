-- SocietyHub Database Schema (MySQL)
-- Version 1.0

-- Disable foreign key checks to allow safe drops
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS notices;
DROP TABLE IF EXISTS maintenance_bills;
DROP TABLE IF EXISTS complaints;
DROP TABLE IF EXISTS visitors;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users Table
-- Stores credentials and details for all four roles: admin, resident, guard, staff
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Hashed with bcrypt
    role ENUM('admin', 'resident', 'guard', 'staff') NOT NULL,
    phone VARCHAR(10) NOT NULL,
    block VARCHAR(50) NULL,         -- Nullable (residents only)
    flat_number VARCHAR(20) NULL,   -- Nullable (residents only)
    flat_type VARCHAR(20) NULL,     -- Nullable (residents only)
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Visitors Table
-- Digital visitor log maintained by security guards
CREATE TABLE visitors (
    visitor_id INT AUTO_INCREMENT PRIMARY KEY,
    visitor_name VARCHAR(100) NOT NULL,
    mobile_number VARCHAR(10) NOT NULL,
    purpose VARCHAR(150) NOT NULL,
    visiting_user_id INT NOT NULL,
    logged_by INT NOT NULL,
    entry_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    exit_time DATETIME NULL,
    FOREIGN KEY (visiting_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (logged_by) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Complaints Table
-- Lightweight ticketing system for residents to raise complaints
CREATE TABLE complaints (
    complaint_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,           -- Resident raising the ticket
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    image_path VARCHAR(255) NULL,
    status ENUM('open', 'in_progress', 'resolved') NOT NULL DEFAULT 'open',
    assigned_to INT NULL,           -- Staff assigned to resolve
    remarks TEXT NULL,              -- Updates by staff/admin
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Maintenance Bills Table
-- Monthly bills and payment recording for flats
CREATE TABLE maintenance_bills (
    bill_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,           -- Resident/flat owner billed
    billing_month VARCHAR(20) NOT NULL, -- e.g. "July 2026"
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('paid', 'unpaid', 'overdue') NOT NULL DEFAULT 'unpaid',
    payment_mode ENUM('cash', 'cheque', 'bank_transfer') NULL,
    reference_number VARCHAR(50) NULL,
    paid_on DATETIME NULL,
    recorded_by INT NULL,           -- Admin who recorded payment
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Notices Table
-- Centralized feed of announcements posted by Admins
CREATE TABLE notices (
    notice_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    posted_by INT NOT NULL,
    posted_on DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (posted_by) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Activity Logs Table
-- Admin dashboard activity feed
CREATE TABLE activity_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action_type VARCHAR(100) NOT NULL, -- e.g. "Payment Recorded", "Notice Posted"
    description VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- SEED DATA FOR TESTING AND DEMOS
-- Passwords are hashed representation of 'password123'
-- Hashed using bcrypt: $2b$12$K1V5FWhzQG/tY8H9D43J9.m2e1B2GZly9c9x1x0f1.3q5r3y1Y2e. (plain text: password123)
-- ==========================================

-- Seed Users
INSERT INTO users (user_id, name, email, password, role, phone, block, flat_number, flat_type, status) VALUES
(1, 'Sarah Chen', 'sarah.chen@societyhub.com', '$2b$12$K1V5FWhzQG/tY8H9D43J9.m2e1B2GZly9c9x1x0f1.3q5r3y1Y2e.', 'admin', '9876543210', NULL, NULL, NULL, 'active'),
(2, 'Arjun Kapoor', 'arjun.k@example.com', '$2b$12$K1V5FWhzQG/tY8H9D43J9.m2e1B2GZly9c9x1x0f1.3q5r3y1Y2e.', 'resident', '9988776655', 'Block A', 'A-402', '3 BHK', 'active'),
(3, 'Vikram Singh', 'vikram.s@societyhub.com', '$2b$12$K1V5FWhzQG/tY8H9D43J9.m2e1B2GZly9c9x1x0f1.3q5r3y1Y2e.', 'guard', '9876511223', NULL, NULL, NULL, 'active'),
(4, 'Ramesh Kumar', 'ramesh.k@societyhub.com', '$2b$12$K1V5FWhzQG/tY8H9D43J9.m2e1B2GZly9c9x1x0f1.3q5r3y1Y2e.', 'staff', '9123456789', NULL, NULL, NULL, 'active'),
(5, 'Neha Sharma', 'neha.sharma@example.com', '$2b$12$K1V5FWhzQG/tY8H9D43J9.m2e1B2GZly9c9x1x0f1.3q5r3y1Y2e.', 'resident', '9888877777', 'Block B', 'B-105', '2 BHK', 'active');

-- Seed Notices
INSERT INTO notices (notice_id, title, description, category, posted_by, posted_on) VALUES
(1, 'Annual General Meeting (AGM) Scheduled', 'The AGM of SocietyHub residents will be held on Sunday, July 20, 2026, at 10:00 AM in the Clubhouse. Attendance is requested from all owners.', 'Meeting', 1, '2026-07-08 09:00:00'),
(2, 'Elevator Maintenance: Block A', 'The elevator in Block A will undergo routine safety inspection and maintenance on July 12, 2026, between 1:00 PM and 4:00 PM. Please use the stairs during this time.', 'Maintenance', 1, '2026-07-09 14:30:00');

-- Seed Maintenance Bills
INSERT INTO maintenance_bills (bill_id, user_id, billing_month, amount, due_date, status, payment_mode, reference_number, paid_on, recorded_by) VALUES
(1, 2, 'June 2026', 4500.00, '2026-06-15', 'paid', 'bank_transfer', 'TXN98234891', '2026-06-14 11:20:00', 1),
(2, 2, 'July 2026', 4500.00, '2026-07-15', 'unpaid', NULL, NULL, NULL, NULL),
(3, 5, 'July 2026', 3800.00, '2026-07-15', 'unpaid', NULL, NULL, NULL, NULL);

-- Seed Complaints
INSERT INTO complaints (complaint_id, user_id, category, description, status, assigned_to, remarks, created_at) VALUES
(1, 2, 'Plumbing', 'Water leakage in the master bedroom bathroom ceiling.', 'in_progress', 4, 'Plumber has inspected the leakage, parts ordered.', '2026-07-09 10:00:00'),
(2, 5, 'Electrical', 'Clubhouse backup generator switch failure in corridor.', 'open', NULL, NULL, '2026-07-10 08:30:00');

-- Seed Visitors
INSERT INTO visitors (visitor_id, visitor_name, mobile_number, purpose, visiting_user_id, logged_by, entry_time, exit_time) VALUES
(1, 'Amit Patel', '9812345670', 'Delivery (Amazon)', 2, 3, '2026-07-10 14:15:00', '2026-07-10 14:28:00'),
(2, 'Dr. Rajan Sen', '9822334455', 'Guest', 5, 3, '2026-07-10 15:30:00', NULL);

-- Seed Activity Logs
INSERT INTO activity_logs (log_id, user_id, action_type, description, created_at) VALUES
(1, 1, 'Bill Generated', 'Generated maintenance bills for July 2026.', '2026-07-01 00:05:00'),
(2, 1, 'Notice Posted', 'Posted AGM announcement to all residents.', '2026-07-08 09:00:00'),
(3, 1, 'Payment Recorded', 'Recorded June 2026 bill payment for Arjun Kapoor.', '2026-06-14 11:20:00');
