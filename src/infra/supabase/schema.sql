-- Areas of the house
CREATE TABLE home_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  creado_en TIMESTAMPTZ DEFAULT now()
);

-- Home events
CREATE TABLE home_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha DATE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('Reparación', 'Mantención', 'Proyecto')),
  titulo TEXT NOT NULL,
  descripcion TEXT DEFAULT '',
  area_id UUID REFERENCES home_areas(id),
  prioridad TEXT NOT NULL DEFAULT 'medium' CHECK (prioridad IN ('low', 'medium', 'high', 'urgent')),
  estado TEXT NOT NULL DEFAULT 'not_started' CHECK (estado IN ('not_started', 'in_progress', 'completed', 'cancelled')),
  costo_materiales DECIMAL(10,2),
  costo_mano_obra DECIMAL(10,2),
  costo_total DECIMAL(10,2),
  proveedor TEXT,
  evento_padre_id UUID REFERENCES home_events(id),
  creado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE event_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES home_events(id) ON DELETE CASCADE,
  foto_url TEXT NOT NULL,
  descripcion TEXT,
  creado_en TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE maintenance_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id UUID REFERENCES home_areas(id),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  frecuencia_dias INTEGER NOT NULL,
  ultima_fecha_completada DATE,
  proxima_fecha DATE NOT NULL,
  creado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_events_fecha ON home_events(fecha);
CREATE INDEX idx_events_tipo ON home_events(tipo);
CREATE INDEX idx_events_area ON home_events(area_id);
CREATE INDEX idx_events_estado ON home_events(estado);
CREATE INDEX idx_photos_evento ON event_photos(evento_id);
CREATE INDEX idx_maintenance_proxima ON maintenance_schedules(proxima_fecha);

-- Auto-update trigger for actualizado_en
CREATE OR REPLACE FUNCTION update_actualizado_en()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_events_update
  BEFORE UPDATE ON home_events
  FOR EACH ROW
  EXECUTE FUNCTION update_actualizado_en();

CREATE TRIGGER trigger_maintenance_update
  BEFORE UPDATE ON maintenance_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_actualizado_en();

-- RLS (open access for family app)
ALTER TABLE home_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public access" ON home_areas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON home_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON event_photos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON maintenance_schedules FOR ALL USING (true) WITH CHECK (true);
