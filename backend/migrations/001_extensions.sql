CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

/*
Down:
DROP FUNCTION IF EXISTS update_updated_at();
DROP EXTENSION IF EXISTS "uuid-ossp";
*/
