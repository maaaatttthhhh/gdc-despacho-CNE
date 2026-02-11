// ============================================================
// FULL SEED - Migrate ALL data from Excel JSON files to database
// ============================================================
import { createConnection } from 'mysql2/promise';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not found');
  process.exit(1);
}

async function main() {
  const conn = await createConnection(DATABASE_URL);
  console.log('Connected to database');

  // Clear existing data
  await conn.execute('DELETE FROM expedientes');
  await conn.execute('DELETE FROM autos');
  await conn.execute('DELETE FROM oficios');
  console.log('Cleared existing data');

  // Read the Excel data using Python-generated JSON
  // First, generate the JSON files from the Excel
  const { execSync } = await import('child_process');
  
  // Generate JSON from Excel
  execSync(`python3 << 'PYEOF'
import openpyxl
import json

wb = openpyxl.load_workbook('/home/ubuntu/upload/-SEMAFOROHSA-.xlsx', data_only=True)

def safe_str(val):
    if val is None:
        return None
    return str(val).strip()

def safe_int(val):
    if val is None:
        return None
    try:
        return int(float(str(val)))
    except:
        return None

# ========== PROCESOS Y PRACTICAS ==========
ws = wb['PROCESOS Y PRACTICAS']
rows = list(ws.iter_rows(min_row=2, values_only=False))
header_row = list(ws.iter_rows(min_row=1, max_row=1, values_only=True))[0]
headers = [safe_str(h) if h else f'col_{i}' for i, h in enumerate(header_row)]
print(f"PROCESOS headers: {headers}")

procesos = []
for row in rows:
    vals = [cell.value for cell in row]
    if not any(vals):
        continue
    record = {}
    for i, h in enumerate(headers):
        if i < len(vals):
            record[h] = vals[i]
    procesos.append(record)

with open('/tmp/procesos.json', 'w') as f:
    json.dump(procesos, f, default=str, ensure_ascii=False)
print(f"Procesos: {len(procesos)} records")

# ========== INF LOGOS ==========
ws = wb['INF LOGOS']
header_row = list(ws.iter_rows(min_row=1, max_row=1, values_only=True))[0]
headers = [safe_str(h) if h else f'col_{i}' for i, h in enumerate(header_row)]
print(f"INF LOGOS headers: {headers}")

inf_logos = []
for row in ws.iter_rows(min_row=2, values_only=True):
    if not any(row):
        continue
    record = {}
    for i, h in enumerate(headers):
        if i < len(row):
            record[h] = row[i]
    inf_logos.append(record)

with open('/tmp/inf_logos.json', 'w') as f:
    json.dump(inf_logos, f, default=str, ensure_ascii=False)
print(f"Inf Logos: {len(inf_logos)} records")

# ========== REVOCATORIAS ==========
ws = wb['REVOCATORIAS']
header_row = list(ws.iter_rows(min_row=1, max_row=1, values_only=True))[0]
headers = [safe_str(h) if h else f'col_{i}' for i, h in enumerate(header_row)]
print(f"REVOCATORIAS headers: {headers}")

revocatorias = []
for row in ws.iter_rows(min_row=2, values_only=True):
    if not any(row):
        continue
    record = {}
    for i, h in enumerate(headers):
        if i < len(row):
            record[h] = row[i]
    revocatorias.append(record)

with open('/tmp/revocatorias.json', 'w') as f:
    json.dump(revocatorias, f, default=str, ensure_ascii=False)
print(f"Revocatorias: {len(revocatorias)} records")

# ========== INF ORDINARIOS ==========
ws = wb['INF ORDINARIOS']
header_row = list(ws.iter_rows(min_row=1, max_row=1, values_only=True))[0]
headers = [safe_str(h) if h else f'col_{i}' for i, h in enumerate(header_row)]
print(f"INF ORDINARIOS headers: {headers}")

inf_ordinarios = []
for row in ws.iter_rows(min_row=2, values_only=True):
    if not any(row):
        continue
    record = {}
    for i, h in enumerate(headers):
        if i < len(row):
            record[h] = row[i]
    inf_ordinarios.append(record)

with open('/tmp/inf_ordinarios.json', 'w') as f:
    json.dump(inf_ordinarios, f, default=str, ensure_ascii=False)
print(f"Inf Ordinarios: {len(inf_ordinarios)} records")

# ========== SALVAMENTOS Y ACLARACIONES P ==========
ws = wb['SALVAMENTOS Y ACLARACIONES P']
header_row = list(ws.iter_rows(min_row=1, max_row=1, values_only=True))[0]
headers = [safe_str(h) if h else f'col_{i}' for i, h in enumerate(header_row)]
print(f"SALVAMENTOS headers: {headers}")

salvamentos = []
for row in ws.iter_rows(min_row=2, values_only=True):
    if not any(row):
        continue
    record = {}
    for i, h in enumerate(headers):
        if i < len(row):
            record[h] = row[i]
    salvamentos.append(record)

with open('/tmp/salvamentos.json', 'w') as f:
    json.dump(salvamentos, f, default=str, ensure_ascii=False)
print(f"Salvamentos: {len(salvamentos)} records")

# ========== ARCHIVADOS ==========
ws = wb['ARCHIVADOS']
header_row = list(ws.iter_rows(min_row=1, max_row=1, values_only=True))[0]
headers = [safe_str(h) if h else f'col_{i}' for i, h in enumerate(header_row)]
print(f"ARCHIVADOS headers: {headers}")

archivados = []
for row in ws.iter_rows(min_row=2, values_only=True):
    if not any(row):
        continue
    record = {}
    for i, h in enumerate(headers):
        if i < len(row):
            record[h] = row[i]
    archivados.append(record)

with open('/tmp/archivados.json', 'w') as f:
    json.dump(archivados, f, default=str, ensure_ascii=False)
print(f"Archivados: {len(archivados)} records")

print("\\nAll JSON files generated successfully!")
PYEOF
`, { stdio: 'inherit' });

  // Helper to read JSON
  const readJson = (path) => JSON.parse(readFileSync(path, 'utf-8'));

  const safeStr = (val) => {
    if (val === null || val === undefined || val === 'None') return null;
    return String(val).trim() || null;
  };
  const safeInt = (val) => {
    if (val === null || val === undefined || val === 'None') return null;
    const n = parseInt(String(val));
    return isNaN(n) ? null : n;
  };

  // Helper to find column value by partial header match
  const findCol = (record, ...patterns) => {
    for (const pattern of patterns) {
      const key = Object.keys(record).find(k => 
        k && k.toUpperCase().includes(pattern.toUpperCase())
      );
      if (key && record[key] !== null && record[key] !== undefined && record[key] !== 'None') {
        return record[key];
      }
    }
    return null;
  };

  // ========== INSERT PROCESOS Y PRACTICAS ==========
  console.log('\n--- Inserting Procesos y Prácticas ---');
  const procesos = readJson('/tmp/procesos.json');
  let insertedProcesos = 0;
  for (const r of procesos) {
    try {
      await conn.execute(
        `INSERT INTO expedientes (modulo, abogado, tema, sujeto, elecciones, lugar, radicadoCne, 
         etapaOf, etapaIp, etapaFc, etapaPr, etapaAc, etapaDf, etapaRc,
         fechaRecibido, diasDespacho, diasEtapa, devuelto,
         enEstudioAbogado, devueltoEstudio, dianaRamos, drLaureano, drUriel,
         enTerminos, enSala, enFirmas, notifContinuaProceso, notifSigueArchivo,
         interponeRecursoArchivo, pausa, observaciones)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'procesos_practicas',
          safeStr(findCol(r, 'ABOGADO')),
          safeStr(findCol(r, 'TEMA')),
          safeStr(findCol(r, 'SUJETO')),
          safeStr(findCol(r, 'ELECCIONES')),
          safeStr(findCol(r, 'LUGAR')),
          safeStr(findCol(r, 'RADICADO')),
          safeStr(findCol(r, 'OF')),
          safeStr(findCol(r, 'IP')),
          safeStr(findCol(r, 'FC')),
          safeStr(findCol(r, 'PR')),
          safeStr(findCol(r, 'AC')),
          safeStr(findCol(r, 'DF')),
          safeStr(findCol(r, 'RC')),
          safeStr(findCol(r, 'FECHA', 'RECIBIDO')),
          safeInt(findCol(r, 'DIAS EN EL DESPACHO', 'DIAS DESPACHO', 'DIAS')),
          safeInt(findCol(r, 'DIAS ETAPA', 'DIAS EN ETAPA')),
          safeInt(findCol(r, 'DEVUELTO')),
          safeStr(findCol(r, 'EN ESTUDIO POR EL ABOGADO', 'ESTUDIO ABOGADO')),
          safeStr(findCol(r, 'DEVUELTO - EN ESTUDIO', 'DEVUELTO ESTUDIO')),
          safeStr(findCol(r, 'DIANA RAMOS')),
          safeStr(findCol(r, 'DR LAUREANO', 'LAUREANO')),
          safeStr(findCol(r, 'DR URIEL', 'URIEL')),
          safeStr(findCol(r, 'EN TÉRMINOS', 'EN TERMINOS', 'TERMINOS')),
          safeStr(findCol(r, 'EN SALA', 'SALA')),
          safeStr(findCol(r, 'EN FIRMAS', 'FIRMAS')),
          safeStr(findCol(r, 'NOTIFICACIÓN CONTINUA', 'NOTIF CONTINUA', 'CONTINUA PROCESO')),
          safeStr(findCol(r, 'NOTIFICACIÓN SIGUE', 'SIGUE ARCHIVO')),
          safeStr(findCol(r, 'INTERPONE RECURSO', 'RECURSO')),
          safeStr(findCol(r, 'PAUSA')),
          safeStr(findCol(r, 'OBSERVACIONES', 'OBS')),
        ]
      );
      insertedProcesos++;
    } catch (e) {
      console.error(`Error inserting proceso: ${e.message}`);
    }
  }
  console.log(`Inserted ${insertedProcesos} procesos`);

  // ========== INSERT INF LOGOS ==========
  console.log('\n--- Inserting Inf Logos ---');
  const infLogos = readJson('/tmp/inf_logos.json');
  let insertedLogos = 0;
  for (const r of infLogos) {
    try {
      await conn.execute(
        `INSERT INTO expedientes (modulo, abogado, tema, sujeto, elecciones, lugar, radicadoCne,
         etapaOf, etapaIp, etapaFc, etapaPr, etapaAc, etapaDf, etapaRc,
         fechaRecibido, diasDespacho, diasEtapa, devuelto,
         enEstudioAbogado, devueltoEstudio, dianaRamos, drLaureano, drUriel,
         enTerminos, enSala, enFirmas, notifContinuaProceso, notifSigueArchivo,
         interponeRecursoArchivo, pausa, observaciones)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'inf_logos',
          safeStr(findCol(r, 'ABOGADO')),
          safeStr(findCol(r, 'TEMA')),
          safeStr(findCol(r, 'SUJETO')),
          safeStr(findCol(r, 'ELECCIONES')),
          safeStr(findCol(r, 'LUGAR')),
          safeStr(findCol(r, 'RADICADO')),
          safeStr(findCol(r, 'OF')),
          safeStr(findCol(r, 'IP')),
          safeStr(findCol(r, 'FC')),
          safeStr(findCol(r, 'PR')),
          safeStr(findCol(r, 'AC')),
          safeStr(findCol(r, 'DF')),
          safeStr(findCol(r, 'RC')),
          safeStr(findCol(r, 'FECHA', 'RECIBIDO')),
          safeInt(findCol(r, 'DIAS EN EL DESPACHO', 'DIAS DESPACHO', 'DIAS')),
          safeInt(findCol(r, 'DIAS ETAPA', 'DIAS EN ETAPA')),
          safeInt(findCol(r, 'DEVUELTO')),
          safeStr(findCol(r, 'EN ESTUDIO POR EL ABOGADO', 'ESTUDIO ABOGADO')),
          safeStr(findCol(r, 'DEVUELTO - EN ESTUDIO', 'DEVUELTO ESTUDIO')),
          safeStr(findCol(r, 'DIANA RAMOS')),
          safeStr(findCol(r, 'DR LAUREANO', 'LAUREANO')),
          safeStr(findCol(r, 'DR URIEL', 'URIEL')),
          safeStr(findCol(r, 'EN TÉRMINOS', 'EN TERMINOS', 'TERMINOS')),
          safeStr(findCol(r, 'EN SALA', 'SALA')),
          safeStr(findCol(r, 'EN FIRMAS', 'FIRMAS')),
          safeStr(findCol(r, 'NOTIFICACIÓN CONTINUA', 'NOTIF CONTINUA', 'CONTINUA PROCESO')),
          safeStr(findCol(r, 'NOTIFICACIÓN SIGUE', 'SIGUE ARCHIVO')),
          safeStr(findCol(r, 'INTERPONE RECURSO', 'RECURSO')),
          safeStr(findCol(r, 'PAUSA')),
          safeStr(findCol(r, 'OBSERVACIONES', 'OBS')),
        ]
      );
      insertedLogos++;
    } catch (e) {
      console.error(`Error inserting inf_logo: ${e.message}`);
    }
  }
  console.log(`Inserted ${insertedLogos} inf logos`);

  // ========== INSERT REVOCATORIAS ==========
  console.log('\n--- Inserting Revocatorias ---');
  const revocatorias = readJson('/tmp/revocatorias.json');
  let insertedRevoc = 0;
  for (const r of revocatorias) {
    try {
      await conn.execute(
        `INSERT INTO expedientes (modulo, abogado, tema, sujeto, elecciones, lugar, radicadoCne,
         fechaRecibido, diasDespacho, observaciones, estadoProceso, ubicacionActual)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'revocatorias',
          safeStr(findCol(r, 'ABOGADO')),
          safeStr(findCol(r, 'TEMA')),
          safeStr(findCol(r, 'SUJETO')),
          safeStr(findCol(r, 'ELECCIONES')),
          safeStr(findCol(r, 'LUGAR')),
          safeStr(findCol(r, 'RADICADO')),
          safeStr(findCol(r, 'FECHA', 'RECIBIDO')),
          safeInt(findCol(r, 'DIAS EN EL DESPACHO', 'DIAS DESPACHO', 'DIAS')),
          safeStr(findCol(r, 'OBSERVACIONES', 'OBS')),
          safeStr(findCol(r, 'ESTADO', 'ESTADO PROCESO')),
          safeStr(findCol(r, 'UBICACIÓN', 'UBICACION')),
        ]
      );
      insertedRevoc++;
    } catch (e) {
      console.error(`Error inserting revocatoria: ${e.message}`);
    }
  }
  console.log(`Inserted ${insertedRevoc} revocatorias`);

  // ========== INSERT INF ORDINARIOS ==========
  console.log('\n--- Inserting Inf Ordinarios ---');
  const infOrdinarios = readJson('/tmp/inf_ordinarios.json');
  let insertedOrd = 0;
  for (const r of infOrdinarios) {
    try {
      await conn.execute(
        `INSERT INTO expedientes (modulo, abogado, tema, sujeto, elecciones, lugar, radicadoCne,
         fechaRecibido, diasDespacho, observaciones, estadoProceso, ubicacionActual)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'inf_ordinarios',
          safeStr(findCol(r, 'ABOGADO')),
          safeStr(findCol(r, 'TEMA')),
          safeStr(findCol(r, 'SUJETO')),
          safeStr(findCol(r, 'ELECCIONES')),
          safeStr(findCol(r, 'LUGAR')),
          safeStr(findCol(r, 'RADICADO')),
          safeStr(findCol(r, 'FECHA', 'RECIBIDO')),
          safeInt(findCol(r, 'DIAS EN EL DESPACHO', 'DIAS DESPACHO', 'DIAS')),
          safeStr(findCol(r, 'OBSERVACIONES', 'OBS')),
          safeStr(findCol(r, 'ESTADO', 'ESTADO PROCESO')),
          safeStr(findCol(r, 'UBICACIÓN', 'UBICACION')),
        ]
      );
      insertedOrd++;
    } catch (e) {
      console.error(`Error inserting inf_ordinario: ${e.message}`);
    }
  }
  console.log(`Inserted ${insertedOrd} inf ordinarios`);

  // ========== INSERT SALVAMENTOS ==========
  console.log('\n--- Inserting Salvamentos ---');
  const salvamentos = readJson('/tmp/salvamentos.json');
  let insertedSalv = 0;
  for (const r of salvamentos) {
    try {
      await conn.execute(
        `INSERT INTO expedientes (modulo, abogado, tema, sujeto, elecciones, lugar, radicadoCne,
         fechaRecibido, diasDespacho, observaciones, estadoProceso, ubicacionActual)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'salvamentos',
          safeStr(findCol(r, 'ABOGADO')),
          safeStr(findCol(r, 'TEMA')),
          safeStr(findCol(r, 'SUJETO')),
          safeStr(findCol(r, 'ELECCIONES')),
          safeStr(findCol(r, 'LUGAR')),
          safeStr(findCol(r, 'RADICADO')),
          safeStr(findCol(r, 'FECHA', 'RECIBIDO')),
          safeInt(findCol(r, 'DIAS EN EL DESPACHO', 'DIAS DESPACHO', 'DIAS')),
          safeStr(findCol(r, 'OBSERVACIONES', 'OBS')),
          safeStr(findCol(r, 'ESTADO', 'ESTADO PROCESO')),
          safeStr(findCol(r, 'UBICACIÓN', 'UBICACION')),
        ]
      );
      insertedSalv++;
    } catch (e) {
      console.error(`Error inserting salvamento: ${e.message}`);
    }
  }
  console.log(`Inserted ${insertedSalv} salvamentos`);

  // ========== INSERT ARCHIVADOS ==========
  console.log('\n--- Inserting Archivados ---');
  const archivados = readJson('/tmp/archivados.json');
  let insertedArch = 0;
  for (const r of archivados) {
    try {
      await conn.execute(
        `INSERT INTO expedientes (modulo, abogado, tema, sujeto, elecciones, lugar, radicadoCne,
         fechaRecibido, diasDespacho, observaciones, estadoProceso, ubicacionActual)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'archivados',
          safeStr(findCol(r, 'ABOGADO')),
          safeStr(findCol(r, 'TEMA')),
          safeStr(findCol(r, 'SUJETO')),
          safeStr(findCol(r, 'ELECCIONES')),
          safeStr(findCol(r, 'LUGAR')),
          safeStr(findCol(r, 'RADICADO')),
          safeStr(findCol(r, 'FECHA', 'RECIBIDO')),
          safeInt(findCol(r, 'DIAS EN EL DESPACHO', 'DIAS DESPACHO', 'DIAS')),
          safeStr(findCol(r, 'OBSERVACIONES', 'OBS')),
          safeStr(findCol(r, 'ESTADO', 'ESTADO PROCESO')),
          safeStr(findCol(r, 'UBICACIÓN', 'UBICACION')),
        ]
      );
      insertedArch++;
    } catch (e) {
      console.error(`Error inserting archivado: ${e.message}`);
    }
  }
  console.log(`Inserted ${insertedArch} archivados`);

  // Final summary
  const [summary] = await conn.execute('SELECT modulo, COUNT(*) as total FROM expedientes GROUP BY modulo');
  console.log('\n========== RESUMEN FINAL ==========');
  let grandTotal = 0;
  for (const row of summary) {
    console.log(`${row.modulo}: ${row.total}`);
    grandTotal += row.total;
  }
  console.log(`TOTAL EXPEDIENTES: ${grandTotal}`);
  
  const [autosCount] = await conn.execute('SELECT COUNT(*) as total FROM autos');
  const [oficiosCount] = await conn.execute('SELECT COUNT(*) as total FROM oficios');
  console.log(`AUTOS: ${autosCount[0].total}`);
  console.log(`OFICIOS: ${oficiosCount[0].total}`);

  await conn.end();
  console.log('\nSeed completed successfully!');
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
