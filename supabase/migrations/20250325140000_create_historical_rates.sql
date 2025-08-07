
/*
  # Create Historical Rates System

  1. New Tables
    - `historical_rates`
      - `id` (uuid, primary key)
      - `date` (date, not null)
      - `currency` (text, not null)
      - `gsdc_rate` (numeric, not null)
      - `benchmark_rates` (jsonb, not null)
      - `created_at` (timestamptz, not null)

  2. Security
    - Enable RLS
    - Public read access
    - Admin write access

  3. Indexes
    - Date + currency for efficient queries
    - Date for time-based queries
*/

-- Create historical_rates table
CREATE TABLE IF NOT EXISTS historical_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  currency text NOT NULL,
  gsdc_rate numeric NOT NULL,
  benchmark_rates jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_gsdc_rate CHECK (gsdc_rate >= 0),
  CONSTRAINT unique_date_currency UNIQUE (date, currency)
);

-- Enable RLS
ALTER TABLE historical_rates ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_historical_rates_date_currency ON historical_rates(date, currency);
CREATE INDEX idx_historical_rates_date ON historical_rates(date DESC);
CREATE INDEX idx_historical_rates_currency ON historical_rates(currency);

-- Create policies
CREATE POLICY "Allow public read access to historical_rates"
  ON historical_rates
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admins to manage historical_rates"
  ON historical_rates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles ar
      WHERE ar.user_address = (auth.uid())::text
      AND ar.role IN ('SUPER_ADMIN', 'ADMIN', 'PRICE_UPDATER')
    )
  );
