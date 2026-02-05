-- Migration: Add scheduling tables for appointment booking system
-- Run this against your Neon PostgreSQL database

-- Business hours / availability windows
CREATE TABLE IF NOT EXISTS availability_slots (
  id SERIAL PRIMARY KEY,
  day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),  -- 0=Sun, 1=Mon, etc.
  start_time TIME NOT NULL,        -- e.g., '09:00'
  end_time TIME NOT NULL,          -- e.g., '17:00'
  slot_duration_minutes INT DEFAULT 60 CHECK (slot_duration_minutes > 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Booked appointments
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  lead_id INT REFERENCES leads(id) ON DELETE SET NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  property_address TEXT,
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add appointment reference to leads table (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'appointment_id'
  ) THEN
    ALTER TABLE leads ADD COLUMN appointment_id INT REFERENCES appointments(id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'booking_status'
  ) THEN
    ALTER TABLE leads ADD COLUMN booking_status VARCHAR(20) DEFAULT 'none';
  END IF;
END $$;

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_reminder ON appointments(reminder_sent, status);
CREATE INDEX IF NOT EXISTS idx_availability_day ON availability_slots(day_of_week, is_active);

-- Seed default availability: Monday - Friday, 9am - 5pm, 1 hour slots
-- Clear existing if re-running
DELETE FROM availability_slots WHERE is_active = true;

-- Monday (1) through Friday (5)
INSERT INTO availability_slots (day_of_week, start_time, end_time, slot_duration_minutes, is_active) VALUES
  (1, '09:00', '17:00', 60, true),  -- Monday
  (2, '09:00', '17:00', 60, true),  -- Tuesday
  (3, '09:00', '17:00', 60, true),  -- Wednesday
  (4, '09:00', '17:00', 60, true),  -- Thursday
  (5, '09:00', '17:00', 60, true);  -- Friday

-- Verify the setup
SELECT 'Availability slots created:' as message;
SELECT * FROM availability_slots ORDER BY day_of_week;
