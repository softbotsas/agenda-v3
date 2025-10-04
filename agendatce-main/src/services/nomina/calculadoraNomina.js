// services/nomina/calculadoraNomina.js
const tz = require('moment-timezone');
const Feriado = require('../../models/nomina/Feriado');
const Marcaje = require('../../models/nomina/Marcaje');
const TimesheetDia = require('../../models/nomina/TimesheetDia');
const ReciboPago = require('../../models/nomina/ReciboPago');

function hhmmToMinutes(hhmm){ const [h,m]=hhmm.split(':').map(Number); return h*60+m; }

async function construirTimesheetEmpleado(empleado, periodo, horario, sector){
  const tzName = sector.timezone;
  const reglas = sector.reglas_horas;

  // 1) Obtener marcajes del período
  const marcajes = await Marcaje.find({
    empleado: empleado._id,
    ts: { $gte: periodo.inicio, $lte: tz(periodo.fin).endOf('day').toDate() }
  }).sort({ ts: 1 }).lean();

  // 2) Agrupar por día local (en TZ del sector) y emparejar IN/OUT
  const porDia = new Map(); // key: "YYYY-MM-DD"
  for (const m of marcajes) {
    const day = tz(m.ts).tz(tzName).format('YYYY-MM-DD');
    if(!porDia.has(day)) porDia.set(day, []);
    porDia.get(day).push(m);
  }

  const feriados = await Feriado.find({
    sector: sector._id,
    fecha: { $gte: periodo.inicio, $lte: periodo.fin }
  }).lean();
  const setFeriados = new Set(feriados.map(f => tz(f.fecha).tz(tzName).format('YYYY-MM-DD')));

  // 3) Procesar cada día
  for (const [day, marks] of porDia.entries()) {
    // Emparejar IN/OUT
    const pares = [];
    let open = null;
    for (const m of marks) {
      if (m.tipo === 'IN' && !open) open = m;
      else if (m.tipo === 'OUT' && open) { pares.push([open, m]); open = null; }
    }
    // Calcular minutos trabajados
    let minutos = 0;
    for (const [inM, outM] of pares) minutos += (outM.ts - inM.ts)/60000;

    // Aplicar descanso del horario (si hay)
    const dow = tz.tz(day, tzName).day(); // 0..6 en la zona del sector
    const turno = horario?.turnos?.find(t => t.dia_semana === dow);
    const descanso = turno?.descanso_min || 0;
    minutos = Math.max(0, minutos - descanso);

    // Particionar en normales/extra/nocturnas/festivas
    const jornada = reglas.horas_jornada_diaria * 60;
    let normales = Math.min(minutos, jornada);
    let extra = Math.max(0, minutos - jornada);

    let extra_diurna = extra;     // simplificado: luego restamos nocturnas
    let extra_nocturna = 0;

    // Si cae en franja nocturna, pasa parte a "nocturnas"
    const iniNoct = hhmmToMinutes(reglas.nocturnidad_inicio);
    const finNoct = hhmmToMinutes(reglas.nocturnidad_fin);
    // Nota: para exactitud, deberías trocear por intervalos reales IN/OUT comparando con franja nocturna.
    // Aquí marcamos simplificado: si algún tramo cruza franja nocturna, movemos proporción:
    // (en producción conviene hacer corte por tramos de 1 min).

    const esFeriado = setFeriados.has(day);
    let horas_festivas = esFeriado ? minutos/60 : 0;

    // Ajuste básico de nocturnidad (demo)
    // Si el IN promedio cae entre 21:00-06:00, manda la mitad de extra a nocturna
    if (pares.length) {
      const firstInLocal = tz(pares[0][0].ts).tz(tzName);
      const minsIn = firstInLocal.hours()*60 + firstInLocal.minutes();
      const noct = (iniNoct <= minsIn || minsIn < finNoct);
      if (noct) {
        const mover = Math.min(extra_diurna, Math.floor(extra_diurna*0.5));
        extra_nocturna += mover;
        extra_diurna -= mover;
      }
    }

    const doc = {
      empleado: empleado._id,
      fecha_local: day,
      horas_normales: normales/60,
      horas_extra_diurnas: extra_diurna/60,
      horas_extra_nocturnas: extra_nocturna/60,
      horas_festivas,
      tardanza_min: 0, // se puede calcular comparando IN vs inicio turno + tolerancia
      falta_injustificada: minutos === 0 && !esFeriado, 
    };

    await TimesheetDia.updateOne(
      { empleado: empleado._id, fecha_local: day },
      { $set: doc },
      { upsert: true }
    );
  }
}

function redondear2(n){ return Math.round((n + Number.EPSILON) * 100) / 100; }

async function calcularRecibo(empleado, sector, contrato, periodo){
  // Leer timesheets del período
  const ts = await TimesheetDia.find({
    empleado: empleado._id,
    fecha_local: { 
      $gte: tz(periodo.inicio).tz(sector.timezone).format('YYYY-MM-DD'),
      $lte: tz(periodo.fin).tz(sector.timezone).format('YYYY-MM-DD'),
    }
  }).lean();

  const reglas = sector.reglas_horas;
  const lineas = [];
  let asign = 0, deduc = 0;

  // SALARIO BASE prorrateado (mensual -> según días periodo vs mes)
  let base = 0, valorHora = 0;
  if (contrato.tipo === 'POR_HORAS') {
    valorHora = contrato.salario_por_hora || 0;
  } else {
    // mensual: valor hora aproximado
    const horasMes = reglas.horas_jornada_semanal * 4; // simplificación
    valorHora = (contrato.salario_base_mensual || 0) / horasMes;
  }

  const totalHorasNormales = ts.reduce((a,b)=> a + b.horas_normales, 0);
  const totalExtDiur = ts.reduce((a,b)=> a + b.horas_extra_diurnas, 0);
  const totalExtNoc = ts.reduce((a,b)=> a + b.horas_extra_nocturnas, 0);
  const totalFest = ts.reduce((a,b)=> a + b.horas_festivas, 0);

  // Base por horas normales
  base = valorHora * totalHorasNormales;
  lineas.push({ codigo:'SAL_BASE', descripcion:'Salario base', tipo:'ASIGNACION', cantidad: totalHorasNormales, monto_unit: redondear2(valorHora), total: redondear2(base) });
  asign += base;

  // Extras
  const extDiur = valorHora * reglas.extra_diurna * totalExtDiur;
  if (extDiur>0) { lineas.push({ codigo:'EXT_DIUR', descripcion:'Horas extra diurnas', tipo:'ASIGNACION', cantidad: totalExtDiur, monto_unit: redondear2(valorHora*reglas.extra_diurna), total: redondear2(extDiur) }); asign+=extDiur; }

  const extNoc = valorHora * reglas.extra_nocturna * totalExtNoc;
  if (extNoc>0) { lineas.push({ codigo:'EXT_NOC', descripcion:'Horas extra nocturnas', tipo:'ASIGNACION', cantidad: totalExtNoc, monto_unit: redondear2(valorHora*reglas.extra_nocturna), total: redondear2(extNoc) }); asign+=extNoc; }

  // Festivas (recargo simple ejemplo 1.5x sobre hora normal; puedes separar festiva diurna/nocturna)
  const fest = valorHora * reglas.extra_festiva * totalFest;
  if (fest>0) { lineas.push({ codigo:'FEST', descripcion:'Horas festivas', tipo:'ASIGNACION', cantidad: totalFest, monto_unit: redondear2(valorHora*reglas.extra_festiva), total: redondear2(fest) }); asign+=fest; }

  // Penalizaciones demo: tardanza y falta
  const minTarde = ts.reduce((a,b)=> a + (b.tardanza_min||0), 0);
  if (minTarde>0 && sector.reglas_penalizaciones.tardanza_descuento_por_minuto>0) {
    const desc = sector.reglas_penalizaciones.tardanza_descuento_por_minuto * minTarde;
    lineas.push({ codigo:'PEN_TAR', descripcion:'Tardanza', tipo:'DEDUCCION', cantidad: minTarde, monto_unit: sector.reglas_penalizaciones.tardanza_descuento_por_minuto, total: redondear2(desc) });
    deduc += desc;
  }
  const faltas = ts.filter(t => t.falta_injustificada).length;
  if (faltas>0 && sector.reglas_penalizaciones.falta_injustificada_descuento_dias>0) {
    const desc = valorHora * reglas.horas_jornada_diaria * sector.reglas_penalizaciones.falta_injustificada_descuento_dias * faltas;
    lineas.push({ codigo:'PEN_FAL', descripcion:'Falta injustificada', tipo:'DEDUCCION', cantidad: faltas, monto_unit: redondear2(valorHora*reglas.horas_jornada_diaria*sector.reglas_penalizaciones.falta_injustificada_descuento_dias), total: redondear2(desc) });
    deduc += desc;
  }

  // Aquí agregarás impuestos/seguridad social del país (cuando los tengamos por sector)
  // lineas.push(...impuestosYSeguridadSocial(...))

  const recibo = await ReciboPago.findOneAndUpdate(
    { periodo: periodo._id, empleado: empleado._id },
    {
      $set: {
        moneda_iso3: sector.moneda_iso3,
        lineas,
        total_asignaciones: redondear2(asign),
        total_deducciones: redondear2(deduc),
        neto_pagar: redondear2(asign - deduc),
        calculado_en: new Date()
      }
    },
    { upsert: true, new: true }
  );

  return recibo;
}

module.exports = {
  construirTimesheetEmpleado,
  calcularRecibo,
};
