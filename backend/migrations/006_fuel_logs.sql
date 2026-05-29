CREATE TABLE fuel_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  trip_id UUID REFERENCES trips(id),
  litres_purchased NUMERIC(12, 2) NOT NULL,
  cost_per_litre NUMERIC(12, 2) NOT NULL,
  total_cost NUMERIC(12, 2) NOT NULL,
  odometer_reading INTEGER NOT NULL,
  location TEXT NOT NULL,
  logged_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fuel_logs_vehicle_id ON fuel_logs(vehicle_id);
CREATE INDEX idx_fuel_logs_trip_id ON fuel_logs(trip_id);
CREATE INDEX idx_fuel_logs_logged_by ON fuel_logs(logged_by);

CREATE TRIGGER trg_fuel_logs_updated_at
BEFORE UPDATE ON fuel_logs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

/*
Down:
DROP TRIGGER IF EXISTS trg_fuel_logs_updated_at ON fuel_logs;
DROP TABLE IF EXISTS fuel_logs;
*/
