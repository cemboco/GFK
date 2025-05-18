/*
  # Add detailed feedback columns

  1. Changes
    - Add new columns to feedback table:
      - `reasons` (text array, stores selected feedback reasons)
      - `other_reason` (text, stores custom feedback reason)
      - `better_formulation` (text, stores user's suggested better formulation)
*/

ALTER TABLE feedback
ADD COLUMN IF NOT EXISTS reasons text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS other_reason text,
ADD COLUMN IF NOT EXISTS better_formulation text;