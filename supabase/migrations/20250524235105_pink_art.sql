/*
  # Remove payment-related tables
  
  This migration removes tables that are no longer needed since we're moving to Stripe:
  - user_payments
  - user_credit_history
  - credit_feedback
*/

DROP TABLE IF EXISTS user_payments;
DROP TABLE IF EXISTS user_credit_history;
DROP TABLE IF EXISTS credit_feedback;