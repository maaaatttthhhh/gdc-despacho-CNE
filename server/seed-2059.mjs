import fs from 'fs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

async function main() {
  const conn = await mysql.createConnection(DATABASE_URL);
  
  // Clear existing expedientes
  await conn.execute('DELETE FROM expedientes');
  console.log('Cleared existing expedientes');
  
  // Load the 2059 records from DATA PARA INFORME
  const data = JSON.parse(fs.readFileSync('/home/ubuntu/data_full_2059.json', 'utf-8'));
  console.log(`Loaded ${data.length} records from DATA PARA INFORME`);
  
  // Load Salvamentos from the extracted JSON (separate sheet)
  let salvamentos = [];
  try {
    salvamentos = JSON.parse(fs.readFileSync('/home/ubuntu/excel_data/salvamentos.json', 'utf-8'));
    console.log(`Loaded ${salvamentos.length} salvamentos from separate sheet`);
  } catch (e) {
    console.log('No salvamentos JSON found, will skip');
  }
  
  const INSERT_SQL = `INSERT INTO expedientes (
    modulo, numero, abogado, tema, sujeto, elecciones, lugar,
    radicadoCne, proceso, referencia, fechaRadicado,
    etapa, estado, inicioTerminos,
    fechaRecibido, diasDespacho, diasEtapa, diasEtapaCurso,
    enEstudioAbogado, devueltoEstudio, dianaRamos, drLaureano, drUriel,
    enSala, enTerminos, enFirmas, notifContinuaProceso, notifSigueArchivo,
    interponeRecursoArchivo, pausa, archivadoDespacho,
    observaciones, fechaVencimiento,
    tema2, anio, color, abogadoProcesosVivos
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  let inserted = 0;
  let errors = 0;
  
  for (const r of data) {
    try {
      const diasDespacho = r.diasEnDespacho != null ? Math.round(Number(r.diasEnDespacho)) : null;
      const diasEtapaCurso = r.diasEtapaCurso != null ? Math.round(Number(r.diasEtapaCurso)) : null;
      const anio = r.anio != null ? Number(r.anio) : null;
      
      await conn.execute(INSERT_SQL, [
        r.modulo || 'inf_ordinarios',
        r.numero || null,
        r.abogado || null,
        r.tema || null,
        r.sujeto || null,
        null, // elecciones - not in DATA PARA INFORME
        r.lugar || null,
        r.radicadoCNE || null,
        r.proceso || null,
        r.referencia || null,
        r.fechaRadicado || null,
        r.etapa || null,
        r.estado || null,
        r.inicioTerminos || null,
        r.fechaRecibido || null,
        isNaN(diasDespacho) ? null : diasDespacho,
        null, // diasEtapa
        isNaN(diasEtapaCurso) ? null : diasEtapaCurso,
        r.enEstudioAbogado || '-',
        r.devuelto || '-',
        r.dianaRamos || '-',
        r.drLaureano || '-',
        r.drUriel || '-',
        r.enSala || '-',
        r.enTerminos || '-',
        r.enFirmas || '-',
        r.enNotifContinua || '-',
        r.enNotifArchivo || '-',
        r.interponeRecurso || '-',
        r.pausaVal || '-',
        r.archivadoDespacho || '-',
        r.observaciones || null,
        r.fechaVencimiento || null,
        r.tema2 || null,
        isNaN(anio) ? null : anio,
        r.color || null,
        r.abogadoProcesosVivos || null,
      ]);
      inserted++;
    } catch (e) {
      errors++;
      if (errors <= 3) console.error(`Error inserting record ${r.numero}: ${e.message}`);
    }
  }
  
  console.log(`Inserted ${inserted} records from DATA PARA INFORME (${errors} errors)`);
  
  // Now insert Salvamentos
  const SALV_SQL = `INSERT INTO expedientes (
    modulo, abogado, tema, sujeto, radicadoCne,
    diasDespacho, devuelto,
    enEstudioAbogado, devueltoEstudio, dianaRamos, drLaureano, drUriel,
    observaciones
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  let salvInserted = 0;
  for (const s of salvamentos) {
    try {
      await conn.execute(SALV_SQL, [
        'salvamentos',
        s.responsable || s.abogado || null,
        s.tema || null,
        s.ponente || null,
        s.expediente || s.radicadoCne || null,
        s.diasDespacho || null,
        s.devuelto || null,
        s.enEstudioAbogado || '-',
        s.devueltoEstudio || '-',
        s.dianaRamos || '-',
        s.drLaureano || '-',
        s.drUriel || '-',
        s.observaciones || null,
      ]);
      salvInserted++;
    } catch (e) {
      console.error(`Error inserting salvamento: ${e.message}`);
    }
  }
  
  console.log(`Inserted ${salvInserted} salvamentos`);
  
  // Verify counts
  const [rows] = await conn.execute('SELECT modulo, COUNT(*) as cnt FROM expedientes GROUP BY modulo ORDER BY cnt DESC');
  console.log('\nFinal counts by module:');
  let total = 0;
  for (const row of rows) {
    console.log(`  ${row.modulo}: ${row.cnt}`);
    total += Number(row.cnt);
  }
  console.log(`  TOTAL: ${total}`);
  
  await conn.end();
  console.log('\nDone!');
}

main().catch(e => { console.error(e); process.exit(1); });
