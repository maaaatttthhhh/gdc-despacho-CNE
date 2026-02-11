// ============================================================
// SEED DB - Insert all Excel data from JSON files into database
// ============================================================
import { createConnection } from 'mysql2/promise';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error('DATABASE_URL not found'); process.exit(1); }

const readJson = (path) => JSON.parse(readFileSync(path, 'utf-8'));

const safeStr = (val) => {
  if (val === null || val === undefined || val === 'None' || val === 'none') return null;
  const s = String(val).trim();
  return s || null;
};
const safeInt = (val) => {
  if (val === null || val === undefined || val === 'None') return null;
  const n = parseInt(String(val));
  return isNaN(n) ? null : n;
};

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

async function insertExpediente(conn, modulo, r) {
  await conn.execute(
    `INSERT INTO expedientes (modulo, abogado, tema, sujeto, elecciones, lugar, radicadoCne,
     etapaOf, etapaIp, etapaFc, etapaPr, etapaAc, etapaDf, etapaRc,
     fechaRecibido, diasDespacho, diasEtapa, devuelto,
     enEstudioAbogado, devueltoEstudio, dianaRamos, drLaureano, drUriel,
     enTerminos, enSala, enFirmas, notifContinuaProceso, notifSigueArchivo,
     interponeRecursoArchivo, pausa, observaciones, estadoProceso, ubicacionActual)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      modulo,
      safeStr(findCol(r, 'ABOGADO')),
      safeStr(findCol(r, 'TEMA')),
      safeStr(findCol(r, 'SUJETO')),
      safeStr(findCol(r, 'ELECCIONES')),
      safeStr(findCol(r, 'LUGAR')),
      safeStr(findCol(r, 'RADICADO')),
      safeStr(findCol(r, 'OF', 'OFICIO')),
      safeStr(findCol(r, 'IP', 'IND. PRELIMINAR')),
      safeStr(findCol(r, 'FC', 'FOR. CARGOS')),
      safeStr(findCol(r, 'PR', 'PRUEBAS')),
      safeStr(findCol(r, 'AC', 'ALE. CONCLUSIÓN')),
      safeStr(findCol(r, 'DF', 'DECISIÓN FINAL')),
      safeStr(findCol(r, 'RC', 'RECURSO')),
      safeStr(findCol(r, 'FECHA RECIBIDO', 'FECHA')),
      safeInt(findCol(r, 'DIAS EN DESPACHO', 'DIAS EN EL DESPACHO', 'DIAS DESPACHO')),
      safeInt(findCol(r, 'DIAS EN ETAPA', 'DIAS ETAPA')),
      safeInt(findCol(r, '# DE VECES', 'DEVUELTO')),
      safeStr(findCol(r, 'EN ESTUDIO POR EL ABOGADO')),
      safeStr(findCol(r, 'DEVUELTO - EN ESTUDIO')),
      safeStr(findCol(r, 'DIANA RAMOS')),
      safeStr(findCol(r, 'DR LAUREANO', 'LAUREANO')),
      safeStr(findCol(r, 'DR URIEL', 'URIEL')),
      safeStr(findCol(r, 'EN TÉRMINOS', 'TERMINOS')),
      safeStr(findCol(r, 'EN SALA', 'SALA')),
      safeStr(findCol(r, 'EN FIRMAS', 'FIRMAS')),
      safeStr(findCol(r, 'NOTIFICACIÓN CONTINUA', 'CONTINUA PROCESO')),
      safeStr(findCol(r, 'NOTIFICACIÓN SIGUE', 'SIGUE ARCHIVO')),
      safeStr(findCol(r, 'INTERPONE RECURSO', 'RECURSO - ARCHIVO')),
      safeStr(findCol(r, 'PAUSA')),
      safeStr(findCol(r, 'OBSERVACIONES', 'OBS')),
      safeStr(findCol(r, 'ESTADO PROCESO', 'ESTADO')),
      safeStr(findCol(r, 'UBICACIÓN', 'UBICACION ACTUAL')),
    ]
  );
}

async function main() {
  const conn = await createConnection(DATABASE_URL);
  console.log('Connected to database');

  // Clear existing expedientes
  await conn.execute('DELETE FROM expedientes');
  console.log('Cleared existing expedientes');

  const modules = [
    { key: 'procesos', modulo: 'procesos_practicas', file: '/tmp/procesos.json' },
    { key: 'inf_logos', modulo: 'inf_logos', file: '/tmp/inf_logos.json' },
    { key: 'revocatorias', modulo: 'revocatorias', file: '/tmp/revocatorias.json' },
    { key: 'inf_ordinarios', modulo: 'inf_ordinarios', file: '/tmp/inf_ordinarios.json' },
    { key: 'salvamentos', modulo: 'salvamentos', file: '/tmp/salvamentos.json' },
    { key: 'archivados', modulo: 'archivados', file: '/tmp/archivados.json' },
  ];

  for (const mod of modules) {
    console.log(`\n--- Inserting ${mod.key} ---`);
    const records = readJson(mod.file);
    let inserted = 0;
    let errors = 0;
    for (const r of records) {
      try {
        await insertExpediente(conn, mod.modulo, r);
        inserted++;
      } catch (e) {
        errors++;
        if (errors <= 3) console.error(`  Error: ${e.message.substring(0, 100)}`);
      }
    }
    console.log(`  Inserted: ${inserted}, Errors: ${errors}`);
  }

  // Summary
  const [summary] = await conn.execute('SELECT modulo, COUNT(*) as total FROM expedientes GROUP BY modulo');
  console.log('\n========== RESUMEN FINAL ==========');
  let grandTotal = 0;
  for (const row of summary) {
    console.log(`  ${row.modulo}: ${row.total}`);
    grandTotal += Number(row.total);
  }
  console.log(`  TOTAL EXPEDIENTES: ${grandTotal}`);

  await conn.end();
  console.log('\nSeed completed!');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
