/*
  # Add Missing Indexes for Foreign Keys

  Problem: Foreign key constraints without covering indexes
  Solution: Add indexes for all foreign keys to improve query performance

  Tables affected:
  - feedback
  - messages
  - profiles
  - chat_usage
  - user_payments
  - user_credit_history
*/

-- Add index for feedback.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_feedback_user_id 
    ON public.feedback(user_id);

-- Add index for messages.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_messages_user_id 
    ON public.messages(user_id);

-- Add index for chat_usage.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_chat_usage_user_id 
    ON public.chat_usage(user_id);

-- Add index for user_payments.user_id foreign key (if table exists)
CREATE INDEX IF NOT EXISTS idx_user_payments_user_id 
    ON public.user_payments(user_id);

-- Add index for user_credit_history.user_id foreign key (if table exists)
CREATE INDEX IF NOT EXISTS idx_user_credit_history_user_id 
    ON public.user_credit_history(user_id);

-- Add composite indexes for better performance on common queries
CREATE INDEX IF NOT EXISTS idx_messages_user_created 
    ON public.messages(user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_feedback_user_created 
    ON public.feedback(user_id, created_at);

-- Add index for anonymous_usage.identifier (if table exists)
CREATE INDEX IF NOT EXISTS idx_anonymous_usage_identifier 
    ON public.anonymous_usage(identifier);

-- Add index for ip_usage.ip (if table exists)
CREATE INDEX IF NOT EXISTS idx_ip_usage_ip 
    ON public.ip_usage(ip); 