/*
  # Remove credit and payment system

  1. Tables to drop
    - `user_credit_history`
    - `user_payments`

  2. Changes
    - Remove all credit-related tables and constraints
    - Clean up any references
*/

-- Drop tables in correct order (considering foreign key constraints)
DROP TABLE IF EXISTS public.user_credit_history;
DROP TABLE IF EXISTS public.user_payments;

-- Remove any remaining policies or functions related to credits
-- (These may not exist but we'll try to drop them safely)
DROP FUNCTION IF EXISTS get_or_create_system_user();