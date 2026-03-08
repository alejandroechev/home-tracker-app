import { Command } from 'commander';
import {
  createEvent, getAllEvents, getEventById, updateEvent, deleteEvent,
  createArea, getAllAreas, getAreaByName,
  createSchedule, getAllSchedules, markScheduleCompleted, deleteSchedule,
} from '../infra/store-provider';
import {
  validateCreateEvent, validateUpdateEvent,
  validateCreateArea,
  validateCreateSchedule,
} from '../domain/validators';
import type { CreateHomeEventInput, UpdateHomeEventInput, EventType, Priority, EventStatus } from '../domain/models';
import type { HomeEventFilters } from '../domain/services';

const program = new Command();
program.name('home-tracker').description('Home Tracker CLI').version('1.0.0');

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function exitWithErrors(errors: { field: string; message: string }[]): never {
  console.error('Validation errors:');
  for (const e of errors) {
    console.error(`  - ${e.field}: ${e.message}`);
  }
  process.exit(1);
}

// Resolve an area name to its id; auto-create if it doesn't exist
async function resolveAreaId(areaName: string): Promise<string> {
  const existing = await getAreaByName(areaName);
  if (existing) return existing.id;
  const created = await createArea({ name: areaName });
  console.log(`Área "${areaName}" creada automáticamente (id: ${created.id})`);
  return created.id;
}

// ── Area commands ──────────────────────────────────────────────

const areaCmd = program.command('area').description('Manage home areas');

areaCmd
  .command('crear')
  .description('Create a new area')
  .requiredOption('--nombre <name>', 'Area name')
  .action(async (opts: { nombre: string }) => {
    const input = { name: opts.nombre };
    const validation = validateCreateArea(input);
    if (!validation.valid) exitWithErrors(validation.errors);

    const area = await createArea(input);
    console.log(JSON.stringify(area, null, 2));
  });

areaCmd
  .command('listar')
  .description('List all areas')
  .action(async () => {
    const areas = await getAllAreas();
    if (areas.length === 0) {
      console.log('No hay áreas registradas.');
      return;
    }
    console.table(areas.map(a => ({ id: a.id, nombre: a.name, creado: a.createdAt })));
  });

// ── Event commands ─────────────────────────────────────────────

const eventoCmd = program.command('evento').description('Manage home events');

eventoCmd
  .command('crear')
  .description('Create a new event')
  .requiredOption('--tipo <type>', 'Event type (Reparación | Mantención | Proyecto)')
  .requiredOption('--titulo <title>', 'Event title')
  .requiredOption('--area <name>', 'Area name')
  .requiredOption('--prioridad <priority>', 'Priority (low | medium | high | urgent)')
  .requiredOption('--descripcion <description>', 'Description')
  .option('--fecha <date>', 'Date (YYYY-MM-DD)', todayISO())
  .option('--costo-materiales <amount>', 'Materials cost')
  .option('--costo-mano-obra <amount>', 'Labor cost')
  .option('--costo-total <amount>', 'Total cost')
  .option('--proveedor <vendor>', 'Vendor name')
  .action(async (opts) => {
    const areaId = await resolveAreaId(opts.area);
    const input: CreateHomeEventInput = {
      date: opts.fecha,
      type: opts.tipo as EventType,
      title: opts.titulo,
      description: opts.descripcion,
      areaId,
      priority: opts.prioridad as Priority,
      materialsCost: opts.costoMateriales ? Number(opts.costoMateriales) : undefined,
      laborCost: opts.costoManoObra ? Number(opts.costoManoObra) : undefined,
      totalCost: opts.costoTotal ? Number(opts.costoTotal) : undefined,
      vendorName: opts.proveedor,
    };

    const validation = validateCreateEvent(input);
    if (!validation.valid) exitWithErrors(validation.errors);

    const event = await createEvent(input);
    console.log(JSON.stringify(event, null, 2));
  });

eventoCmd
  .command('listar')
  .description('List events with optional filters')
  .option('--tipo <type>', 'Filter by type')
  .option('--area <name>', 'Filter by area name')
  .option('--prioridad <priority>', 'Filter by priority')
  .option('--estado <status>', 'Filter by status')
  .option('--desde <date>', 'From date (YYYY-MM-DD)')
  .option('--hasta <date>', 'To date (YYYY-MM-DD)')
  .action(async (opts) => {
    const filters: HomeEventFilters = {};
    if (opts.tipo) filters.type = opts.tipo as EventType;
    if (opts.prioridad) filters.priority = opts.prioridad as Priority;
    if (opts.estado) filters.status = opts.estado as EventStatus;
    if (opts.desde) filters.fromDate = opts.desde;
    if (opts.hasta) filters.toDate = opts.hasta;
    if (opts.area) {
      const area = await getAreaByName(opts.area);
      if (area) filters.areaId = area.id;
      else {
        console.log(`No se encontró el área "${opts.area}".`);
        return;
      }
    }

    const events = await getAllEvents(filters);
    if (events.length === 0) {
      console.log('No hay eventos registrados.');
      return;
    }
    console.table(events.map(e => ({
      id: e.id, fecha: e.date, tipo: e.type, titulo: e.title,
      prioridad: e.priority, estado: e.status,
    })));
  });

eventoCmd
  .command('ver')
  .description('View a single event')
  .argument('<id>', 'Event ID')
  .action(async (id: string) => {
    const event = await getEventById(id);
    if (!event) {
      console.error(`Evento con id "${id}" no encontrado.`);
      process.exit(1);
    }
    console.log(JSON.stringify(event, null, 2));
  });

eventoCmd
  .command('editar')
  .description('Edit an existing event')
  .argument('<id>', 'Event ID')
  .option('--titulo <title>', 'New title')
  .option('--fecha <date>', 'New date')
  .option('--tipo <type>', 'New type')
  .option('--prioridad <priority>', 'New priority')
  .option('--estado <status>', 'New status')
  .option('--descripcion <description>', 'New description')
  .option('--costo-materiales <amount>', 'Materials cost')
  .option('--costo-mano-obra <amount>', 'Labor cost')
  .option('--costo-total <amount>', 'Total cost')
  .option('--proveedor <vendor>', 'Vendor name')
  .action(async (id: string, opts) => {
    const existing = await getEventById(id);
    if (!existing) {
      console.error(`Evento con id "${id}" no encontrado.`);
      process.exit(1);
    }

    const input: UpdateHomeEventInput = {};
    if (opts.titulo) input.title = opts.titulo;
    if (opts.fecha) input.date = opts.fecha;
    if (opts.tipo) input.type = opts.tipo as EventType;
    if (opts.prioridad) input.priority = opts.prioridad as Priority;
    if (opts.estado) input.status = opts.estado as EventStatus;
    if (opts.descripcion) input.description = opts.descripcion;
    if (opts.costoMateriales) input.materialsCost = Number(opts.costoMateriales);
    if (opts.costoManoObra) input.laborCost = Number(opts.costoManoObra);
    if (opts.costoTotal) input.totalCost = Number(opts.costoTotal);
    if (opts.proveedor) input.vendorName = opts.proveedor;

    const validation = validateUpdateEvent(input);
    if (!validation.valid) exitWithErrors(validation.errors);

    const updated = await updateEvent(id, input);
    console.log(JSON.stringify(updated, null, 2));
  });

eventoCmd
  .command('eliminar')
  .description('Delete an event')
  .argument('<id>', 'Event ID')
  .action(async (id: string) => {
    await deleteEvent(id);
    console.log(`Evento "${id}" eliminado.`);
  });

// ── Maintenance commands ───────────────────────────────────────

const mantCmd = program.command('mantencion').description('Manage maintenance schedules');

mantCmd
  .command('crear')
  .description('Create a maintenance schedule')
  .requiredOption('--titulo <title>', 'Schedule title')
  .requiredOption('--area <name>', 'Area name')
  .requiredOption('--frecuencia <days>', 'Frequency in days')
  .requiredOption('--proxima-fecha <date>', 'Next due date (YYYY-MM-DD)')
  .option('--descripcion <description>', 'Description')
  .action(async (opts) => {
    const areaId = await resolveAreaId(opts.area);
    const input = {
      areaId,
      title: opts.titulo,
      description: opts.descripcion,
      frequencyDays: Number(opts.frecuencia),
      nextDueDate: opts.proximaFecha as string,
    };

    const validation = validateCreateSchedule(input);
    if (!validation.valid) exitWithErrors(validation.errors);

    const schedule = await createSchedule(input);
    console.log(JSON.stringify(schedule, null, 2));
  });

mantCmd
  .command('listar')
  .description('List all maintenance schedules')
  .action(async () => {
    const schedules = await getAllSchedules();
    if (schedules.length === 0) {
      console.log('No hay mantenciones registradas.');
      return;
    }
    console.table(schedules.map(s => ({
      id: s.id, titulo: s.title, frecuencia: `${s.frequencyDays}d`,
      proxima: s.nextDueDate, ultima: s.lastCompletedDate ?? '-',
    })));
  });

mantCmd
  .command('completar')
  .description('Mark a maintenance schedule as completed')
  .argument('<id>', 'Schedule ID')
  .option('--fecha <date>', 'Completion date (YYYY-MM-DD)')
  .action(async (id: string, opts: { fecha?: string }) => {
    const completedDate = opts.fecha ?? todayISO();
    const schedule = await markScheduleCompleted(id, completedDate);
    console.log(JSON.stringify(schedule, null, 2));
  });

mantCmd
  .command('eliminar')
  .description('Delete a maintenance schedule')
  .argument('<id>', 'Schedule ID')
  .action(async (id: string) => {
    await deleteSchedule(id);
    console.log(`Mantención "${id}" eliminada.`);
  });

// ── Run ────────────────────────────────────────────────────────

program.parseAsync(process.argv);
