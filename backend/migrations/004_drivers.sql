CREATE TYPE driver_status AS ENUM ('available', 'on_trip', 'inactive');

CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  license_number TEXT NOT NULL UNIQUE,
  license_expiry DATE NOT NULL,
  phone TEXT,
  status driver_status NOT NULL DEFAULT 'available',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_drivers_user_id ON drivers(user_id);
CREATE INDEX idx_drivers_status ON drivers(status);

CREATE TRIGGER trg_drivers_updated_at
BEFORE UPDATE ON drivers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

/*
Down:
DROP TRIGGER IF EXISTS trg_drivers_updated_at ON drivers;
DROP TABLE IF EXISTS drivers;
DROP TYPE IF EXISTS driver_status;
*/
