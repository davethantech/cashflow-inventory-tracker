-- Create database
CREATE DATABASE cashflow_tracker;

-- Connect to database
\c cashflow_tracker;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create OTP verifications table (for temporary OTP storage)
CREATE TABLE IF NOT EXISTS otp_verifications (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_sales_user_id ON sales(user_id);
CREATE INDEX idx_sales_sale_date ON sales(sale_date);
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_purchases_user_id ON purchases(user_id);
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_pending_sync_user_id ON pending_sync(user_id);
CREATE INDEX idx_pending_sync_sync_status ON pending_sync(sync_status);

-- Create view for daily sales summary
CREATE OR REPLACE VIEW daily_sales_summary AS
SELECT 
    user_id,
    DATE(sale_date) as sale_date,
    COUNT(*) as total_transactions,
    COALESCE(SUM(total_amount), 0) as total_sales,
    COALESCE(SUM(amount_paid), 0) as total_cash_collected,
    COALESCE(SUM(balance), 0) as total_balance
FROM sales
GROUP BY user_id, DATE(sale_date);
