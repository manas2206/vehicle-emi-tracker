CREATE DATABASE IF NOT EXISTS vehicle_emi;
USE vehicle_emi;

CREATE TABLE IF NOT EXISTS vehicles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    registration_number VARCHAR(20) UNIQUE NOT NULL,
    vehicle_type ENUM('car', 'bike', 'truck', 'other') NOT NULL,
    model VARCHAR(100),
    owner_name VARCHAR(100),
    loan_amount DECIMAL(12,2),
    tenure_months INT,
    interest_rate DECIMAL(5,2),
    start_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS emi_schedule (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_id INT NOT NULL,
    month_label VARCHAR(20),
    due_date DATE,
    amount DECIMAL(10,2),
    status ENUM('paid', 'pending', 'overdue') DEFAULT 'pending',
    paid_date DATE NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Sample data
INSERT INTO vehicles (registration_number, vehicle_type, model, owner_name, loan_amount, tenure_months, interest_rate, start_date)
VALUES
  ('MH12AB1234', 'car',   'Toyota Innova 2022',          'Rahul Sharma',  700000, 48, 9.5, '2025-01-01'),
  ('KA05MN4567', 'bike',  'Royal Enfield Classic 350',   'Priya Nair',    150000, 36, 10.0,'2025-01-01'),
  ('DL1CT9900',  'truck', 'Tata Ace 2021',               'Suresh Yadav',  900000, 60, 8.75,'2024-11-01');

-- EMI schedule for MH12AB1234
INSERT INTO emi_schedule (vehicle_id, month_label, due_date, amount, status, paid_date) VALUES
(1,'Jan 2025','2025-01-05',18500,'paid','2025-01-04'),
(1,'Feb 2025','2025-02-05',18500,'paid','2025-02-03'),
(1,'Mar 2025','2025-03-05',18500,'paid','2025-03-05'),
(1,'Apr 2025','2025-04-05',18500,'paid','2025-04-02'),
(1,'May 2025','2025-05-05',18500,'paid','2025-05-06'),
(1,'Jun 2025','2025-06-05',18500,'pending',NULL);

-- EMI schedule for KA05MN4567
INSERT INTO emi_schedule (vehicle_id, month_label, due_date, amount, status, paid_date) VALUES
(2,'Jan 2025','2025-01-05',4200,'paid','2025-01-05'),
(2,'Feb 2025','2025-02-05',4200,'paid','2025-02-04'),
(2,'Mar 2025','2025-03-05',4200,'pending',NULL),
(2,'Apr 2025','2025-04-05',4200,'pending',NULL);

-- EMI schedule for DL1CT9900
INSERT INTO emi_schedule (vehicle_id, month_label, due_date, amount, status, paid_date) VALUES
(3,'Nov 2024','2024-11-05',22000,'paid','2024-11-04'),
(3,'Dec 2024','2024-12-05',22000,'paid','2024-12-03'),
(3,'Jan 2025','2025-01-05',22000,'paid','2025-01-05'),
(3,'Feb 2025','2025-02-05',22000,'paid','2025-02-04'),
(3,'Mar 2025','2025-03-05',22000,'paid','2025-03-05'),
(3,'Apr 2025','2025-04-05',22000,'paid','2025-04-02'),
(3,'May 2025','2025-05-05',22000,'pending',NULL);
