/**
 * SEED FINAL - Carga datos de las hojas individuales del Excel con TODAS las columnas
 * + datos adicionales de DATA PARA INFORME para completar archivados históricos.
 * Total esperado: ~2059+ registros
 */
import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const DATA_DIR = '/home/ubuntu/excel_data_final';
const DATA_DIR_V3 = '/home/ubuntu/excel_data_v3';

function readJSON(filename) {
  return JSON.parse(readFileSync(`${DATA_DIR}/${filename}`, 'utf-8'));
}

function safeInt(val) {
  if (val === '' || val === null || val === undefined || val === 'None') return null;
  const n = parseInt(val);
  return isNaN(n) ? null : n;
}

function safeStr(val) {
  if (val === null || val === undefined || val === 'None') return null;
  const s = String(val).trim();
  return s === '' ? null : s;
}

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  // Clear existing expedientes
  await conn.execute('DELETE FROM expedientes');
  console.log('Cleared existing expedientes');

  let totalInserted = 0;

  // Helper to insert in batches
  async function insertBatch(records, modulo) {
    let count = 0;
    for (const rec of records) {
      const sql = `INSERT INTO expedientes (
        modulo, abogado, tema, sujeto, elecciones, lugar, radicadoCne,
        etapaOf, etapaIp, etapaFc, etapaPr, etapaAc, etapaDf, etapaRc,
        fechaRecibido, diasDespacho, diasEtapa, devuelto,
        enEstudioAbogado, devueltoEstudio, dianaRamos, drLaureano, drUriel,
        enTerminos, enSala, enFirmas, notifContinuaProceso, notifSigueArchivo,
        interponeRecursoArchivo, pausa, observaciones,
        fechaRepartoInterno, diasAbogado,
        tipoSalvamento, ponente, resolucion, semaforoDias, enAbogado, devueltoAbogado,
        fechaArchivo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      
      const values = [
        modulo,
        safeStr(rec.abogado || rec.responsable),
        safeStr(rec.tema),
        safeStr(rec.sujeto),
        safeStr(rec.elecciones),
        safeStr(rec.lugar),
        safeStr(rec.radicado || rec.expediente),
        safeStr(rec.etapa_of),
        safeStr(rec.etapa_ip),
        safeStr(rec.etapa_fc),
        safeStr(rec.etapa_pr || rec.etapa_p),
        safeStr(rec.etapa_ac),
        safeStr(rec.etapa_df),
        safeStr(rec.etapa_rc || rec.etapa_r),
        safeStr(rec.fecha_recibido),
        safeInt(rec.dias_despacho),
        safeInt(rec.dias_etapa),
        safeInt(rec.veces_devuelto),
        safeStr(rec.en_estudio_abogado),
        safeStr(rec.devuelto_estudio_abogado),
        safeStr(rec.diana_ramos),
        safeStr(rec.dr_laureano),
        safeStr(rec.dr_uriel),
        safeStr(rec.en_terminos),
        safeStr(rec.en_sala),
        safeStr(rec.en_firmas),
        safeStr(rec.notificacion_continua),
        safeStr(rec.notificacion_archivo),
        safeStr(rec.interpone_recurso),
        safeStr(rec.pausa),
        safeStr(rec.observaciones),
        // Revocatorias extra
        safeStr(rec.fecha_reparto_interno),
        safeInt(rec.dias_abogado),
        // Salvamentos extra
        safeStr(rec.tipo),
        safeStr(rec.ponente),
        safeStr(rec.resolucion),
        safeInt(rec.semaforo_dias),
        safeStr(rec.en_abogado),
        safeStr(rec.devuelto_abogado),
        // Archivados extra
        safeStr(rec.fecha_archivo),
      ];
      
      await conn.execute(sql, values);
      count++;
    }
    totalInserted += count;
    console.log(`  ${modulo}: ${count} registros insertados`);
  }

  // 1. Procesos y Prácticas (47)
  console.log('\n=== Cargando hojas individuales ===');
  const procesos = readJSON('procesos_practicas.json');
  await insertBatch(procesos, 'procesos_practicas');

  // 2. Inf. Logos (51)
  const infLogos = readJSON('inf_logos.json');
  await insertBatch(infLogos, 'inf_logos');

  // 3. Revocatorias (16)
  const revocatorias = readJSON('revocatorias.json');
  await insertBatch(revocatorias, 'revocatorias');

  // 4. Inf. Ordinarios (125)
  const infOrdinarios = readJSON('inf_ordinarios.json');
  await insertBatch(infOrdinarios, 'inf_ordinarios');

  // 5. Salvamentos y Aclaraciones (14)
  const salvamentos = readJSON('salvamentos.json');
  await insertBatch(salvamentos, 'salvamentos');

  // 6. Archivados (728 from individual sheet)
  const archivados = readJSON('archivados.json');
  await insertBatch(archivados, 'archivados');

  console.log(`\n=== Hojas individuales: ${totalInserted} registros ===`);

  // 7. Now load additional archivados from DATA PARA INFORME to reach 2059
  // DATA PARA INFORME has 2060 records total, including active ones
  // We need to add the archivados that are NOT in the individual sheets
  console.log('\n=== Cargando archivados adicionales de DATA PARA INFORME ===');
  const dataInforme = JSON.parse(readFileSync(`${DATA_DIR}/data_informe_full.json`, 'utf-8'));
  
  // Get existing radicados from individual sheets to avoid duplicates
  const [existingRows] = await conn.execute('SELECT radicadoCne FROM expedientes WHERE radicadoCne IS NOT NULL');
  const existingRadicados = new Set(existingRows.map(r => r.radicadoCne?.trim().toLowerCase()));
  
  let additionalCount = 0;
  for (const rec of dataInforme) {
    const radicado = safeStr(rec.radicado);
    if (!radicado) continue;
    
    // Skip if already exists
    if (existingRadicados.has(radicado.trim().toLowerCase())) continue;
    
    // Determine modulo from TEMA2
    let modulo = 'archivados';
    const tema2 = (rec.tema2 || '').toUpperCase();
    const etapa = (rec.etapa || '').toUpperCase();
    const estado = (rec.estado || '').toUpperCase();
    
    // Determine modulo from TEMA2
    if (tema2.includes('PROCESO') || tema2.includes('PRACTICA')) modulo = 'procesos_practicas';
    else if (tema2.includes('LOGO')) modulo = 'inf_logos';
    else if (tema2.includes('REVOCATORIA')) modulo = 'revocatorias';
    else if (tema2.includes('ORDINARIO')) modulo = 'inf_ordinarios';
    
    // If archivado, keep as archivados
    if (etapa === 'ARCHIVADO' || estado.includes('ARCHIVADO')) modulo = 'archivados';
    
    // Determine color/semaforo
    const color = safeStr(rec.color);
    
    const sql = `INSERT INTO expedientes (
      modulo, abogado, tema, sujeto, lugar, radicadoCne, etapa, estado,
      fechaRecibido, diasDespacho, diasEtapaCurso, devuelto,
      enEstudioAbogado, devueltoEstudio, dianaRamos, drLaureano, drUriel,
      enSala, enTerminos, enFirmas, notifContinuaProceso, notifSigueArchivo,
      interponeRecursoArchivo, pausa, archivadoDespacho, observaciones,
      tema2, anio, color, abogadoProcesosVivos, proceso, referencia,
      inicioTerminos, fechaVencimiento
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const values = [
      modulo,
      safeStr(rec.abogado),
      safeStr(rec.tema),
      safeStr(rec.solicitante),
      safeStr(rec.lugar),
      radicado,
      safeStr(rec.etapa),
      safeStr(rec.estado),
      safeStr(rec.fecha_recibido),
      safeInt(rec.dias_despacho),
      safeInt(rec.dias_etapa_curso),
      safeInt(rec.devuelto),
      safeStr(rec.en_estudio_abogado),
      safeStr(rec.devuelto_estudio),
      safeStr(rec.diana_ramos),
      safeStr(rec.dr_laureano),
      safeStr(rec.dr_uriel),
      safeStr(rec.en_sala),
      safeStr(rec.en_terminos),
      safeStr(rec.en_firmas),
      safeStr(rec.notif_continua),
      safeStr(rec.notif_archivo),
      safeStr(rec.interpone_recurso),
      safeStr(rec.pausa),
      safeStr(rec.archivado_despacho),
      safeStr(rec.observaciones),
      safeStr(rec.tema2),
      safeInt(rec.anio),
      color,
      safeStr(rec.abogado_procesos_vivos),
      safeStr(rec.proceso),
      safeStr(rec.referencia),
      safeStr(rec.inicio_terminos),
      safeStr(rec.fecha_vencimiento),
    ];
    
    await conn.execute(sql, values);
    additionalCount++;
    existingRadicados.add(radicado.trim().toLowerCase());
  }
  
  totalInserted += additionalCount;
  console.log(`  Archivados adicionales de DATA PARA INFORME: ${additionalCount}`);
  
  // Final count
  const [countResult] = await conn.execute('SELECT COUNT(*) as total FROM expedientes');
  const [moduloCounts] = await conn.execute('SELECT modulo, COUNT(*) as cnt FROM expedientes GROUP BY modulo ORDER BY cnt DESC');
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`TOTAL EN BASE DE DATOS: ${countResult[0].total}`);
  for (const row of moduloCounts) {
    console.log(`  ${row.modulo}: ${row.cnt}`);
  }
  console.log(`${'='.repeat(60)}`);
  
  await conn.end();
}

main().catch(err => { console.error(err); process.exit(1); });
