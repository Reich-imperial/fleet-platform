ALTER TABLE fuel_logs
ADD COLUMN fuelled_at DATE;

UPDATE fuel_logs
SET fuelled_at = created_at::date
WHERE fuelled_at IS NULL;

ALTER TABLE fuel_logs
ALTER COLUMN fuelled_at SET NOT NULL,
ALTER COLUMN fuelled_at SET DEFAULT CURRENT_DATE;

CREATE INDEX idx_fuel_logs_vehicle_fuelled_at ON fuel_logs(vehicle_id, fuelled_at DESC);

/*
Down:
DROP INDEX IF EXISTS idx_fuel_logs_vehicle_fuelled_at;
ALTER TABLE fuel_logs DROP COLUMN IF EXISTS fuelled_at;
*/
