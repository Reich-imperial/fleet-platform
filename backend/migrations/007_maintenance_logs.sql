CREATE TYPE maintenance_type AS ENUM ('routine', 'repair', 'inspection');

CREATE TABLE maintenance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  type maintenance_type NOT NULL,
  description TEXT NOT NULL,
  cost NUMERIC(12, 2) NOT NULL,
  performed_by TEXT NOT NULL,
  performed_at TIMESTAMPTZ NOT NULL,
  next_service_date DATE,
  logged_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_maintenance_logs_vehicle_id ON maintenance_logs(vehicle_id);
CREATE INDEX idx_maintenance_logs_logged_by ON maintenance_logs(logged_by);

CREATE TRIGGER trg_maintenance_logs_updated_at
BEFORE UPDATE ON maintenance_logs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

/*
Down:
DROP TRIGGER IF EXISTS trg_maintenance_logs_updated_at ON maintenance_logs;
DROP TABLE IF EXISTS maintenance_logs;
DROP TYPE IF EXISTS maintenance_type;
*/
