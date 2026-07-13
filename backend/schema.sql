-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Generation Time: Jul 13, 2026 at 08:41 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;

-- Disable foreign key checks to allow safe drops
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `activity_logs`;
DROP TABLE IF EXISTS `notices`;
DROP TABLE IF EXISTS `maintenance_bills`;
DROP TABLE IF EXISTS `complaints`;
DROP TABLE IF EXISTS `visitors`;
DROP TABLE IF EXISTS `registration_requests`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `societyhub`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `log_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `action_type` varchar(100) NOT NULL,
  `description` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`log_id`, `user_id`, `action_type`, `description`, `created_at`) VALUES
(1, 1, 'Bill Generated', 'Generated maintenance bills for July 2026.', '2026-07-01 00:05:00'),
(2, 1, 'Notice Posted', 'Posted AGM announcement to all residents.', '2026-07-08 09:00:00'),
(3, 1, 'Payment Recorded', 'Recorded June 2026 bill payment for Arjun Kapoor.', '2026-06-14 11:20:00');

-- --------------------------------------------------------

--
-- Table structure for table `complaints`
--

CREATE TABLE `complaints` (
  `complaint_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `category` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `status` enum('open','in_progress','resolved') NOT NULL DEFAULT 'open',
  `assigned_to` int(11) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `complaints`
--

INSERT INTO `complaints` (`complaint_id`, `user_id`, `category`, `description`, `image_path`, `status`, `assigned_to`, `remarks`, `created_at`, `updated_at`) VALUES
(1, 2, 'Plumbing', 'Water leakage in the master bedroom bathroom ceiling.', NULL, 'in_progress', 4, 'Plumber has inspected the leakage, parts ordered.', '2026-07-09 10:00:00', '2026-07-10 17:13:51'),
(2, 5, 'Electrical', 'Clubhouse backup generator switch failure in corridor.', NULL, 'open', NULL, NULL, '2026-07-10 08:30:00', '2026-07-10 17:13:51'),
(3, 2, 'Cleaning', 'Need Home cleaning staff', NULL, 'open', NULL, NULL, '2026-07-10 19:37:30', '2026-07-10 19:37:30');

-- --------------------------------------------------------

--
-- Table structure for table `maintenance_bills`
--

CREATE TABLE `maintenance_bills` (
  `bill_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `billing_month` varchar(20) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `due_date` date NOT NULL,
  `status` enum('paid','unpaid','overdue') NOT NULL DEFAULT 'unpaid',
  `payment_mode` enum('cash','cheque','bank_transfer') DEFAULT NULL,
  `reference_number` varchar(50) DEFAULT NULL,
  `paid_on` datetime DEFAULT NULL,
  `recorded_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `maintenance_bills`
--

INSERT INTO `maintenance_bills` (`bill_id`, `user_id`, `billing_month`, `amount`, `due_date`, `status`, `payment_mode`, `reference_number`, `paid_on`, `recorded_by`) VALUES
(1, 2, 'June 2026', 4500.00, '2026-06-15', 'paid', 'bank_transfer', 'TXN98234891', '2026-06-14 11:20:00', 1),
(2, 2, 'July 2026', 4500.00, '2026-07-15', 'unpaid', NULL, NULL, NULL, NULL),
(3, 5, 'July 2026', 3800.00, '2026-07-15', 'unpaid', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `notices`
--

CREATE TABLE `notices` (
  `notice_id` int(11) NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text NOT NULL,
  `category` varchar(50) NOT NULL,
  `posted_by` int(11) NOT NULL,
  `posted_on` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notices`
--

INSERT INTO `notices` (`notice_id`, `title`, `description`, `category`, `posted_by`, `posted_on`) VALUES
(1, 'Annual General Meeting (AGM) Scheduled', 'The AGM of SocietyHub residents will be held on Sunday, July 20, 2026, at 10:00 AM in the Clubhouse. Attendance is requested from all owners.', 'Meeting', 1, '2026-07-08 09:00:00'),
(2, 'Elevator Maintenance: Block A', 'The elevator in Block A will undergo routine safety inspection and maintenance on July 12, 2026, between 1:00 PM and 4:00 PM. Please use the stairs during this time.', 'Maintenance', 1, '2026-07-09 14:30:00'),
(3, 'pest control', 'all need to understand', 'Maintenance', 1, '2026-07-10 19:41:37');

-- --------------------------------------------------------

--
-- Table structure for table `registration_requests`
--

CREATE TABLE `registration_requests` (
  `request_id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(10) NOT NULL,
  `block` varchar(50) NOT NULL,
  `flat_number` varchar(20) NOT NULL,
  `flat_type` varchar(20) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Pending',
  `submitted_at` datetime DEFAULT current_timestamp(),
  `reviewed_at` datetime DEFAULT NULL,
  `reviewed_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `registration_requests`
--

INSERT INTO `registration_requests` (`request_id`, `full_name`, `email`, `phone`, `block`, `flat_number`, `flat_type`, `password_hash`, `status`, `submitted_at`, `reviewed_at`, `reviewed_by`) VALUES
(1, 'Test Resident', 'test.resident@example.com', '9876543210', 'Block B', 'B-302', '2 BHK', '$2b$12$wPv47UQtk0T0ygGk/nFDl.ZioyhhaF1NsXnfuMEtsRdc3aDnpDFqa', 'Pending', '2026-07-11 12:44:53', NULL, NULL),
(2, 'TOSHI NAHATK', 'sbi.05539@sbi.co.in', '7845912633', 'Block A', 'B-700', '3 BHK', '$2b$12$hhBlf3Xs9EchzaEN6Pwa0e6dPGtatZHBlUdHiaAqQMmYM6mjH.K.K', 'Pending', '2026-07-11 12:59:43', NULL, NULL),
(3, 'Test Resident Approved', 'approved.resident@example.com', '9988776655', 'Block C', 'C-102', '3 BHK', '$2b$12$TYne98JFZIqCEr3OfuGkzOpitDC4k1wYF6bBaJi85E3qyaNeg/I0u', 'Approved', '2026-07-11 13:21:33', '2026-07-11 13:28:59', 1),
(4, 'Test Resident Rejected', 'rejected.resident@example.com', '9988776656', 'Block D', 'D-205', '1 BHK', '$2b$12$KymjrIFM9fIGzM7WM2Fi.eY8k.eAw.RjiI8k23HRG3ixAblbNVpS2', 'Rejected', '2026-07-11 13:25:22', '2026-07-11 13:29:42', 1),
(5, 'ujjwal', 'test1.resident@example.com', '8945761230', 'Block A', '300', '2 BHK', '$2b$12$t99G55niHWc5t9/ypVNX2uA.baAQqtnDR1RIs9d8JnxhE5EsOFM6G', 'Approved', '2026-07-11 13:38:28', '2026-07-11 13:38:55', 1);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','resident','guard','staff') NOT NULL,
  `phone` varchar(10) NOT NULL,
  `block` varchar(50) DEFAULT NULL,
  `flat_number` varchar(20) DEFAULT NULL,
  `flat_type` varchar(20) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `name`, `email`, `password`, `role`, `phone`, `block`, `flat_number`, `flat_type`, `status`, `created_at`) VALUES
(1, 'Sarah Chen', 'sarah.chen@societyhub.com', '$2b$12$gpk9UUHGZkt04l0cPxk.hexY.98fN/GOvJg44MNDnSMS.k66IsOPG', 'admin', '9876543210', NULL, NULL, NULL, 'active', '2026-07-10 17:13:51'),
(2, 'Arjun Kapoor', 'arjun.k@example.com', '$2b$12$gpk9UUHGZkt04l0cPxk.hexY.98fN/GOvJg44MNDnSMS.k66IsOPG', 'resident', '9988776655', 'Block A', 'A-402', '3 BHK', 'active', '2026-07-10 17:13:51'),
(3, 'Vikram Singh', 'vikram.s@societyhub.com', '$2b$12$gpk9UUHGZkt04l0cPxk.hexY.98fN/GOvJg44MNDnSMS.k66IsOPG', 'guard', '9876511223', NULL, NULL, NULL, 'active', '2026-07-10 17:13:51'),
(4, 'Ramesh Kumar', 'ramesh.k@societyhub.com', '$2b$12$K1V5FWhzQG/tY8H9D43J9.m2e1B2GZly9c9x1x0f1.3q5r3y1Y2e.', 'staff', '9123456789', NULL, NULL, NULL, 'active', '2026-07-10 17:13:51'),
(5, 'Neha Sharma', 'neha.sharma@example.com', '$2b$12$K1V5FWhzQG/tY8H9D43J9.m2e1B2GZly9c9x1x0f1.3q5r3y1Y2e.', 'resident', '9888877777', 'Block B', 'B-105', '2 BHK', 'active', '2026-07-10 17:13:51'),
(6, 'Test Resident Approved', 'approved.resident@example.com', '$2b$12$TYne98JFZIqCEr3OfuGkzOpitDC4k1wYF6bBaJi85E3qyaNeg/I0u', 'resident', '9988776655', 'Block C', 'C-102', '3 BHK', 'active', '2026-07-11 13:28:59'),
(7, 'ujjwal', 'test1.resident@example.com', '$2b$12$t99G55niHWc5t9/ypVNX2uA.baAQqtnDR1RIs9d8JnxhE5EsOFM6G', 'resident', '8945761230', 'Block A', '300', '2 BHK', 'active', '2026-07-11 13:38:55');

-- --------------------------------------------------------

--
-- Table structure for table `visitors`
--

CREATE TABLE `visitors` (
  `visitor_id` int(11) NOT NULL,
  `visitor_name` varchar(100) NOT NULL,
  `mobile_number` varchar(10) NOT NULL,
  `purpose` varchar(150) NOT NULL,
  `visiting_user_id` int(11) NOT NULL,
  `logged_by` int(11) NOT NULL,
  `entry_time` datetime DEFAULT current_timestamp(),
  `exit_time` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `visitors`
--

INSERT INTO `visitors` (`visitor_id`, `visitor_name`, `mobile_number`, `purpose`, `visiting_user_id`, `logged_by`, `entry_time`, `exit_time`) VALUES
(1, 'Amit Patel', '9812345670', 'Delivery (Amazon)', 2, 3, '2026-07-10 14:15:00', '2026-07-10 14:28:00'),
(2, 'Dr. Rajan Sen', '9822334455', 'Guest', 5, 3, '2026-07-10 15:30:00', NULL),
(3, 'toshi nahatkar', '7894561230', 'Guest', 2, 2, '2026-07-10 19:37:53', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `complaints`
--
ALTER TABLE `complaints`
  ADD PRIMARY KEY (`complaint_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `assigned_to` (`assigned_to`);

--
-- Indexes for table `maintenance_bills`
--
ALTER TABLE `maintenance_bills`
  ADD PRIMARY KEY (`bill_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `recorded_by` (`recorded_by`);

--
-- Indexes for table `notices`
--
ALTER TABLE `notices`
  ADD PRIMARY KEY (`notice_id`),
  ADD KEY `posted_by` (`posted_by`);

--
-- Indexes for table `registration_requests`
--
ALTER TABLE `registration_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `visitors`
--
ALTER TABLE `visitors`
  ADD PRIMARY KEY (`visitor_id`),
  ADD KEY `visiting_user_id` (`visiting_user_id`),
  ADD KEY `logged_by` (`logged_by`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `complaints`
--
ALTER TABLE `complaints`
  MODIFY `complaint_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `maintenance_bills`
--
ALTER TABLE `maintenance_bills`
  MODIFY `bill_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `notices`
--
ALTER TABLE `notices`
  MODIFY `notice_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `registration_requests`
--
ALTER TABLE `registration_requests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `visitors`
--
ALTER TABLE `visitors`
  MODIFY `visitor_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `complaints`
--
ALTER TABLE `complaints`
  ADD CONSTRAINT `complaints_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `complaints_ibfk_2` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `maintenance_bills`
--
ALTER TABLE `maintenance_bills`
  ADD CONSTRAINT `maintenance_bills_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `maintenance_bills_ibfk_2` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `notices`
--
ALTER TABLE `notices`
  ADD CONSTRAINT `notices_ibfk_1` FOREIGN KEY (`posted_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `visitors`
--
ALTER TABLE `visitors`
  ADD CONSTRAINT `visitors_ibfk_1` FOREIGN KEY (`visiting_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `visitors_ibfk_2` FOREIGN KEY (`logged_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
