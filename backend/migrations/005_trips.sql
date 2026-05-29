CREATE TYPE cargo_type AS ENUM ('crude_oil', 'refined_fuel', 'lpg', 'chemicals');
CREATE TYPE trip_status AS ENUM ('scheduled', 'in_transit', 'delivered', 'cancelled');

CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  driver_id UUID NOT NULL REFERENCES drivers(id),
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  cargo_type cargo_type NOT NULL,
  cargo_volume_litres NUMERIC(12, 2) NOT NULL,
  status trip_status NOT NULL DEFAULT 'scheduled',
  scheduled_departure TIMESTAMPTZ NOT NULL,
  actual_departure TIMESTAMPTZ,
  estimated_arrival TIMESTAMPTZ,
  actual_arrival TIMESTAMPTZ,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trips_vehicle_id ON trips(vehicle_id);
CREATE INDEX idx_trips_driver_id ON trips(driver_id);
CREATE INDEX idx_trips_created_by ON trips(created_by);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_scheduled_departure ON trips(scheduled_departure);

CREATE TRIGGER trg_trips_updated_at
BEFORE UPDATE ON trips
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

/*
Down:
DROP TRIGGER IF EXISTS trg_trips_updated_at ON trips;
DROP TABLE IF EXISTS trips;
DROP TYPE IF EXISTS trip_status;
DROP TYPE IF EXISTS cargo_type;
*/
