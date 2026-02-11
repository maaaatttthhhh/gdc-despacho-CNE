import 'dotenv/config';
import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';

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
  
  const modules = [
    { file: '/home/ubuntu/procesos_practicas_v2.json', modulo: 'procesos_practicas', idStart: 30001 },
    { file: '/home/ubuntu/inf_logos_v2.json', modulo: 'inf_logos', idStart: 31001 },
    { file: '/home/ubuntu/revocatorias_v2.json', modulo: 'revocatorias', idStart: 32001 },
    { file: '/home/ubuntu/inf_ordinarios_v2.json', modulo: 'inf_ordinarios', idStart: 33001 },
    { file: '/home/ubuntu/salvamentos_v2.json', modulo: 'salvamentos', idStart: 34001 },
    { file: '/home/ubuntu/archivados_v2.json', modulo: 'archivados', idStart: 35001 },
  ];
  
  for (const mod of modules) {
    const data = JSON.parse(readFileSync(mod.file, 'utf-8'));
    let inserted = 0;
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const id = mod.idStart + i;
      
      try {
        await conn.execute(
          `INSERT INTO expedientes (id, modulo, abogado, tema, sujeto, elecciones, lugar, radicadoCne,
            etapaOf, etapaIp, etapaFc, etapaPr, etapaAc, etapaDf, etapaRc,
            fechaRecibido, diasDespacho, diasEtapa, devuelto,
            enEstudioAbogado, devueltoEstudio, dianaRamos, drLaureano, drUriel,
            enTerminos, enSala, enFirmas, notifContinuaProceso, notifSigueArchivo,
            interponeRecursoArchivo, pausa, observaciones)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            mod.modulo,
            row.abogado || null,
            row.tema || null,
            row.sujeto || null,
            row.elecciones || null,
            row.lugar || null,
            row.radicadoCne || null,
            row.etapaOf || null,
            row.etapaIp || null,
            row.etapaFc || null,
            row.etapaPr || null,
            row.etapaAc || null,
            row.etapaDf || null,
            row.etapaRc || null,
            row.fechaRecibido || null,
            row.diasDespacho || 0,
            row.diasEtapa || 0,
            row.devuelto || 0,
            row.enEstudioAbogado || null,
            row.devueltoEstudio || null,
            row.dianaRamos || null,
            row.drLaureano || null,
            row.drUriel || null,
            row.enTerminos || null,
            row.enSala || null,
            row.enFirmas || null,
            row.notifContinuaProceso || null,
            row.notifSigueArchivo || null,
            row.interponeRecursoArchivo || null,
            row.pausa || null,
            row.observaciones || null,
          ]
        );
        inserted++;
      } catch (err) {
        console.error(`Error inserting ${mod.modulo} row ${i}: ${err.message}`);
      }
    }
    
    console.log(`${mod.modulo}: ${inserted}/${data.length} insertados`);
  }
  
  // Verify
  const [counts] = await conn.execute('SELECT modulo, COUNT(*) as total FROM expedientes GROUP BY modulo ORDER BY modulo');
  console.log('\n=== VERIFICACIÓN FINAL ===');
  for (const row of counts) {
    console.log(`  ${row.modulo}: ${row.total} registros`);
  }
  
  // Verify sample data has sujeto, elecciones, lugar
  const [sample] = await conn.execute('SELECT abogado, sujeto, elecciones, lugar, radicadoCne FROM expedientes WHERE modulo = "procesos_practicas" LIMIT 3');
  console.log('\n=== MUESTRA PROCESOS (verificar sujeto/elecciones/lugar) ===');
  for (const row of sample) {
    console.log(`  ${row.abogado} | ${row.sujeto} | ${row.elecciones} | ${row.lugar} | ${row.radicadoCne}`);
  }
  
  const [sample2] = await conn.execute('SELECT abogado, sujeto, elecciones, lugar, radicadoCne FROM expedientes WHERE modulo = "inf_logos" LIMIT 3');
  console.log('\n=== MUESTRA INF LOGOS (verificar sujeto/elecciones/lugar) ===');
  for (const row of sample2) {
    console.log(`  ${row.abogado} | ${row.sujeto} | ${row.elecciones} | ${row.lugar} | ${row.radicadoCne}`);
  }
  
  const [sample3] = await conn.execute('SELECT abogado, sujeto, elecciones, lugar, radicadoCne FROM expedientes WHERE modulo = "archivados" LIMIT 3');
  console.log('\n=== MUESTRA ARCHIVADOS (verificar sujeto/elecciones/lugar) ===');
  for (const row of sample3) {
    console.log(`  ${row.abogado} | ${row.sujeto} | ${row.elecciones} | ${row.lugar} | ${row.radicadoCne}`);
  }
  
  await conn.end();
  console.log('\nSeed completado exitosamente!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
