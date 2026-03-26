-- Create the renters table
CREATE TABLE renters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  landlord_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  flat TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  monthly_rent NUMERIC NOT NULL,
  initial_light_reading NUMERIC NOT NULL,
  advance_paid BOOLEAN NOT NULL DEFAULT false,
  advance_amount NUMERIC NOT NULL DEFAULT 0,
  moved_in_date DATE NOT NULL,
  moved_out_date DATE,
  notes TEXT,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the rent_records table
CREATE TABLE rent_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  renter_id UUID REFERENCES renters(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  rent_amount NUMERIC NOT NULL,
  light_reading_prev NUMERIC NOT NULL,
  light_reading_curr NUMERIC NOT NULL,
  light_units INTEGER NOT NULL,
  light_bill NUMERIC NOT NULL,
  water_bill NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  amount_paid NUMERIC,
  rent_paid BOOLEAN NOT NULL DEFAULT false,
  payment_mode TEXT,
  paid_date DATE,
  whatsapp_sent BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE renters ENABLE ROW LEVEL SECURITY;
ALTER TABLE rent_records ENABLE ROW LEVEL SECURITY;

-- Create policies for renters
-- Landlords can only select, insert, update, delete their own renters
CREATE POLICY "Landlords can view own renters" ON renters
  FOR SELECT USING (auth.uid() = landlord_id);

CREATE POLICY "Landlords can insert own renters" ON renters
  FOR INSERT WITH CHECK (auth.uid() = landlord_id);

CREATE POLICY "Landlords can update own renters" ON renters
  FOR UPDATE USING (auth.uid() = landlord_id);

CREATE POLICY "Landlords can delete own renters" ON renters
  FOR DELETE USING (auth.uid() = landlord_id);

-- Create policies for rent_records
-- Landlords can only access rent records attached to their own renters
CREATE POLICY "Landlords can view own rent records" ON rent_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM renters
      WHERE renters.id = rent_records.renter_id
      AND renters.landlord_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can insert own rent records" ON rent_records
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM renters
      WHERE renters.id = rent_records.renter_id
      AND renters.landlord_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can update own rent records" ON rent_records
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM renters
      WHERE renters.id = rent_records.renter_id
      AND renters.landlord_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can delete own rent records" ON rent_records
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM renters
      WHERE renters.id = rent_records.renter_id
      AND renters.landlord_id = auth.uid()
    )
  );
