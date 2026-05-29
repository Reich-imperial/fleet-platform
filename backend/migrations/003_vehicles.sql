CREATE TYPE vehicle_type AS ENUM ('tanker', 'truck', 'trailer');
CREATE TYPE vehicle_status AS ENUM ('available', 'in_transit', 'maintenance', 'decommissioned');

CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_number TEXT NOT NULL UNIQUE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  type vehicle_type NOT NULL,
  capacity_litres NUMERIC(12, 2) NOT NULL,
  status vehicle_status NOT NULL DEFAULT 'available',
  last_service_date DATE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vehicles_status ON vehicles(status);

CREATE TRIGGER trg_vehicles_updated_at
BEFORE UPDATE ON vehicles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

/*
Down:
DROP TRIGGER IF EXISTS trg_vehicles_updated_at ON vehicles;
DROP TABLE IF EXISTS vehicles;
DROP TYPE IF EXISTS vehicle_status;
DROP TYPE IF EXISTS vehicle_type;
*/
