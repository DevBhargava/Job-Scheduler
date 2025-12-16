-- Create the database
CREATE DATABASE IF NOT EXISTS job_scheduler;
USE job_scheduler;

-- Drop the table if it exists (for development)
DROP TABLE IF EXISTS jobs;

-- Create jobs table
CREATE TABLE jobs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  taskName VARCHAR(255) NOT NULL,
  payload JSON NOT NULL,
  priority ENUM('Low', 'Medium', 'High') NOT NULL,
  status ENUM('pending', 'running', 'completed', 'failed') DEFAULT 'pending' NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  completedAt TIMESTAMP NULL DEFAULT NULL,
  
  -- Indexes for better query performance
  INDEX idx_status (status),
  INDEX idx_priority (priority),
  INDEX idx_created (createdAt),
  INDEX idx_status_priority (status, priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert some sample data for testing
INSERT INTO jobs (taskName, payload, priority, status) VALUES
('Send Welcome Email', JSON_OBJECT('email', 'user@example.com', 'template', 'welcome'), 'High', 'pending'),
('Generate Monthly Report', JSON_OBJECT('month', 'December', 'year', 2024, 'format', 'PDF'), 'Medium', 'pending'),
('Sync Customer Data', JSON_OBJECT('source', 'CRM', 'destination', 'Database', 'records', 150), 'Low', 'pending'),
('Process Payment', JSON_OBJECT('orderId', 'ORD-12345', 'amount', 99.99, 'currency', 'USD'), 'High', 'completed'),
('Backup Database', JSON_OBJECT('type', 'full', 'destination', 's3://backups/'), 'Medium', 'completed');