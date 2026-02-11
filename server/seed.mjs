/**
 * Seed script: Populates the database with initial data.
 * Run with: node -e "import('dotenv').then(d=>{d.config();import('./server/seed.mjs')})"
 */
import mysql from "mysql2/promise";

async function seed() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const connection = await mysql.createConnection(dbUrl);
  console.log("Connected to database. Seeding...");

  // Clear existing data
  await connection.execute("DELETE FROM alertas");
  await connection.execute("DELETE FROM oficios");
  await connection.execute("DELETE FROM autos");
  await connection.execute("DELETE FROM expedientes");

  // ==================== SEED AUTOS ====================
  const autosData = [
    ["001", "12/1/2024", "44975", "Publicidad", "Margarita Rosa Martínez"],
    ["002", "13/1/2024", "29696", "Financiación", "Margarita Rosa Martínez"],
    ["003", "15/1/2023", "18999", "Publicidad", "Andrea Tobar"],
    ["004", "17/1/2024", "66409", "Publicidad", "Anyi Aguirre"],
    ["005", "23/1/2024", "52944", "Publicidad", "Leonardo Garrido"],
    ["006", "1/2/2024", "25068", "Impugnación", "Laura Ortegón"],
    ["007", "30/1/2024", "42538", "Uso indebido de logos", "Anyi Aguirre"],
  ];
  for (const a of autosData) {
    await connection.execute(
      "INSERT INTO autos (numeroAuto, fecha, radicado, asunto, asesor, createdAt, updatedAt) VALUES (?,?,?,?,?,NOW(),NOW())",
      a
    );
  }
  console.log("  autos: 7 records");

  // ==================== SEED OFICIOS ====================
  const oficiosData = [
    ["OF-001", "5/2/2024", "55123", "Registraduría Nacional", "Solicitud de información electoral", "Karen Ines Palacio Ferrer", "Enviado"],
    ["OF-002", "10/2/2024", "55456", "Procuraduría General", "Remisión de expediente disciplinario", "Leidy Tatiana Yepes Joya", "Enviado"],
    ["OF-003", "15/2/2024", "55789", "Ministerio del Interior", "Consulta sobre partidos políticos", "Angelica Johanna Bastidas Salgado", "Pendiente"],
    ["OF-004", "20/2/2024", "56012", "Contraloría General", "Informe de cuentas de campaña", "Diana Mercedes Vergara Llanos", "Enviado"],
    ["OF-005", "1/3/2024", "56345", "Fiscalía General", "Compulsa de copias", "Julian David López Lovera", "Pendiente"],
  ];
  for (const o of oficiosData) {
    await connection.execute(
      "INSERT INTO oficios (noOficio, fecha, radicado, destinatario, asunto, responsable, estadoOficio, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,NOW(),NOW())",
      o
    );
  }
  console.log("  oficios: 5 records");

  // ==================== SEED ALERTAS ====================
  const alertasData = [
    ["critico", "pendiente", "Karen Ines Palacio Ferrer", "kpalacio@cne.gov.co", "Inf. Logos", "RAD-44521", "El expediente RAD-44521 lleva más de 90 días en despacho. Se requiere actualización urgente."],
    ["critico", "pendiente", "Leidy Tatiana Yepes Joya", "lyepes@cne.gov.co", "Inf. Ordinarios", "RAD-55102", "El expediente RAD-55102 se encuentra en estado crítico. Favor actualizar información."],
    ["precaucion", "enviada", "Angelica Johanna Bastidas Salgado", "abastidas@cne.gov.co", "Procesos y Prácticas", "RAD-33201", "El expediente RAD-33201 está próximo a cumplir 90 días."],
    ["informativo", "leida", "Diana Mercedes Vergara Llanos", "dvergara@cne.gov.co", "Revocatorias", "RAD-22105", "Recordatorio: actualizar el estado del expediente RAD-22105."],
    ["precaucion", "enviada", "Julian David López Lovera", "jlopez@cne.gov.co", "Inf. Logos", "RAD-41003", "El expediente RAD-41003 requiere actualización."],
  ];
  for (const al of alertasData) {
    await connection.execute(
      "INSERT INTO alertas (tipo, estadoAlerta, destinatarioNombre, destinatarioEmail, moduloAlerta, expedienteRef, mensaje, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,NOW(),NOW())",
      al
    );
  }
  console.log("  alertas: 5 records");

  // ==================== SEED EXPEDIENTES FROM EXCEL DATA ====================
  // We'll insert the data using the raw SQL approach with the data from the Excel
  // This is a simplified version - the full data is in moduleData.ts

  // PROCESOS Y PRACTICAS (47 records from Excel)
  const procesosPracticas = [
    ["Diana Mercedes Vergara Llanos", "REGISTRO DE LOGO PROCESO ORGANIZATIVO", "JUNTA DE ACCION COMUNAL BARRIO PUEBLO NUEVO", "CONSEJOS MUNICIPALES Y LOCALES DE JUVENTUD", "SAN CARLOS – ANTIOQUIA"],
    ["Diana Mercedes Vergara Llanos", "REGISTRO DE LOGO PROCESO ORGANIZATIVO", "JUNTA DE ACCION COMUNAL BARRIO PUEBLO NUEVO", "CONSEJOS MUNICIPALES Y LOCALES DE JUVENTUD", "SINCELEJO – SUCRE"],
    ["Julian David López Lovera", "REGISTRO DE LOGO PROCESO ORGANIZATIVO", "FUNDACIÓN IMPULSA FUTURO", "CONSEJOS MUNICIPALES Y LOCALES DE JUVENTUD", "GUAMO – TOLIMA"],
    ["Julian David López Lovera", "REGISTRO DE LOGO PROCESO ORGANIZATIVO", "VEREDA LA FILA", "CONSEJOS MUNICIPALES Y LOCALES DE JUVENTUD", "ICONONZO – TOLIMA"],
    ["Julian David López Lovera", "REGISTRO DE LOGO PROCESO ORGANIZATIVO", "MAGDALENA JOVEN", "CONSEJOS MUNICIPALES Y LOCALES DE JUVENTUD", "SANTA MARTA – MAGDALENA"],
    ["Julian David López Lovera", "REGISTRO DE LOGO PROCESO ORGANIZATIVO", "JUNTA DE ACCION COMUNAL BARRIO LA ESPERANZA", "CONSEJOS MUNICIPALES Y LOCALES DE JUVENTUD", "SANTA MARTA – MAGDALENA"],
    ["Karen Ines Palacio Ferrer", "REGISTRO DE LOGO PROCESO ORGANIZATIVO", "ASOCIACIÓN DE CABILDOS INDÍGENAS DE INZÁ", "CONSEJOS MUNICIPALES Y LOCALES DE JUVENTUD", "INZA – CAUCA"],
    ["Karen Ines Palacio Ferrer", "REGISTRO DE LOGO PROCESO ORGANIZATIVO", "ASOCIACION NACIONAL DE JOVENES CONSTRUCTORES DE PAZ", "CONSEJOS MUNICIPALES Y LOCALES DE JUVENTUD", "YOPAL – CASANARE"],
    ["Karen Ines Palacio Ferrer", "REGISTRO DE LOGO PROCESO ORGANIZATIVO", "ASOCIACION NACIONAL DE JOVENES CONSTRUCTORES DE PAZ", "CONSEJOS MUNICIPALES Y LOCALES DE JUVENTUD", "LA SALINA – CASANARE"],
    ["Karen Ines Palacio Ferrer", "REGISTRO DE LOGO PROCESO ORGANIZATIVO", "JUVENTUD UNION ACTIVA", "CONSEJOS MUNICIPALES Y LOCALES DE JUVENTUD", "OROCUE – CASANARE"],
    ["Karen Ines Palacio Ferrer", "REGISTRO DE LOGO PROCESO ORGANIZATIVO", "ACTIVISTAS ENTRE TODOS", "CONSEJOS MUNICIPALES Y LOCALES DE JUVENTUD", "BARRANQUILLA – ATLANTICO"],
    ["Karen Ines Palacio Ferrer", "REGISTRO DE LOGO PROCESO ORGANIZATIVO", "FUNDACION HOGAR AZUL", "CONSEJOS MUNICIPALES Y LOCALES DE JUVENTUD", "BARRANQUILLA – ATLANTICO"],
    ["Karen Ines Palacio Ferrer", "REGISTRO DE LOGO PROCESO ORGANIZATIVO", "RESGUARDO SAN LORENZO DE CALDONO", "CONSEJOS MUNICIPALES Y LOCALES DE JUVENTUD", "CALDONO – CAUCA"],
    ["Karen Ines Palacio Ferrer", "REGISTRO DE LOGO PROCESO ORGANIZATIVO", "ASOCIACION RED DEPARTAMENTAL DE JUVENTUD", "CONSEJOS MUNICIPALES Y LOCALES DE JUVENTUD", "LA VEGA – CAUCA"],
  ];

  for (const pp of procesosPracticas) {
    await connection.execute(
      `INSERT INTO expedientes (modulo, abogado, tema, sujeto, elecciones, lugar, createdAt, updatedAt)
       VALUES ('procesos_practicas',?,?,?,?,?,NOW(),NOW())`,
      pp
    );
  }
  console.log(`  procesos_practicas: ${procesosPracticas.length} records`);

  // INF LOGOS - sample data (51 records in Excel, inserting representative set)
  const infLogos = [
    ["Karen Ines Palacio Ferrer", "INFORME DE INSCRIPCIÓN DE LOGO", "PARTIDO LIBERAL COLOMBIANO", "ELECCIONES TERRITORIALES 2023", "BOGOTÁ D.C.", 120, "En estudio"],
    ["Karen Ines Palacio Ferrer", "INFORME DE INSCRIPCIÓN DE LOGO", "PARTIDO CONSERVADOR COLOMBIANO", "ELECCIONES TERRITORIALES 2023", "MEDELLÍN – ANTIOQUIA", 95, "En sala"],
    ["Leidy Tatiana Yepes Joya", "INFORME DE INSCRIPCIÓN DE LOGO", "CENTRO DEMOCRÁTICO", "ELECCIONES TERRITORIALES 2023", "CALI – VALLE DEL CAUCA", 85, "En firmas"],
    ["Leidy Tatiana Yepes Joya", "INFORME DE INSCRIPCIÓN DE LOGO", "PACTO HISTÓRICO", "ELECCIONES TERRITORIALES 2023", "BARRANQUILLA – ATLÁNTICO", 110, "Devuelto"],
    ["Angelica Johanna Bastidas Salgado", "INFORME DE INSCRIPCIÓN DE LOGO", "ALIANZA VERDE", "ELECCIONES TERRITORIALES 2023", "BUCARAMANGA – SANTANDER", 45, "En términos"],
    ["Diana Mercedes Vergara Llanos", "INFORME DE INSCRIPCIÓN DE LOGO", "POLO DEMOCRÁTICO", "ELECCIONES TERRITORIALES 2023", "CARTAGENA – BOLÍVAR", 30, "En estudio"],
    ["Julian David López Lovera", "INFORME DE INSCRIPCIÓN DE LOGO", "CAMBIO RADICAL", "ELECCIONES TERRITORIALES 2023", "PEREIRA – RISARALDA", 150, "Archivado"],
  ];

  for (const il of infLogos) {
    await connection.execute(
      `INSERT INTO expedientes (modulo, abogado, tema, sujeto, elecciones, lugar, diasDespacho, enEstudioAbogado, createdAt, updatedAt)
       VALUES ('inf_logos',?,?,?,?,?,?,?,NOW(),NOW())`,
      il
    );
  }
  console.log(`  inf_logos: ${infLogos.length} records`);

  // REVOCATORIAS
  const revocatorias = [
    ["Angelica Johanna Bastidas Salgado", "REVOCATORIA DE MANDATO", "ALCALDE MUNICIPAL", "ELECCIONES TERRITORIALES 2023", "PUERTO BOYACÁ – BOYACÁ", 60],
    ["Angelica Johanna Bastidas Salgado", "REVOCATORIA DE MANDATO", "ALCALDE MUNICIPAL", "ELECCIONES TERRITORIALES 2023", "GIRARDOT – CUNDINAMARCA", 45],
    ["Leidy Tatiana Yepes Joya", "REVOCATORIA DE MANDATO", "GOBERNADOR", "ELECCIONES TERRITORIALES 2023", "ARAUCA – ARAUCA", 90],
    ["Karen Ines Palacio Ferrer", "REVOCATORIA DE MANDATO", "ALCALDE MUNICIPAL", "ELECCIONES TERRITORIALES 2023", "TUMACO – NARIÑO", 120],
  ];

  for (const r of revocatorias) {
    await connection.execute(
      `INSERT INTO expedientes (modulo, abogado, tema, sujeto, elecciones, lugar, diasDespacho, createdAt, updatedAt)
       VALUES ('revocatorias',?,?,?,?,?,?,NOW(),NOW())`,
      r
    );
  }
  console.log(`  revocatorias: ${revocatorias.length} records`);

  // INF ORDINARIOS
  const infOrdinarios = [
    ["Karen Ines Palacio Ferrer", "INFORME ORDINARIO", "CONSULTA POPULAR", "ELECCIONES 2023", "BOGOTÁ D.C.", 75],
    ["Leidy Tatiana Yepes Joya", "INFORME ORDINARIO", "PLEBISCITO", "ELECCIONES 2023", "MEDELLÍN – ANTIOQUIA", 55],
    ["Angelica Johanna Bastidas Salgado", "INFORME ORDINARIO", "REFERENDO", "ELECCIONES 2023", "CALI – VALLE DEL CAUCA", 100],
    ["Diana Mercedes Vergara Llanos", "INFORME ORDINARIO", "CONSULTA INTERNA", "ELECCIONES 2023", "BARRANQUILLA – ATLÁNTICO", 40],
    ["Julian David López Lovera", "INFORME ORDINARIO", "MECANISMO DE PARTICIPACIÓN", "ELECCIONES 2023", "BUCARAMANGA – SANTANDER", 130],
  ];

  for (const io of infOrdinarios) {
    await connection.execute(
      `INSERT INTO expedientes (modulo, abogado, tema, sujeto, elecciones, lugar, diasDespacho, createdAt, updatedAt)
       VALUES ('inf_ordinarios',?,?,?,?,?,?,NOW(),NOW())`,
      io
    );
  }
  console.log(`  inf_ordinarios: ${infOrdinarios.length} records`);

  // SALVAMENTOS Y ACLARACIONES
  const salvamentos = [
    ["Karen Ines Palacio Ferrer", "SALVAMENTO DE VOTO", "RESOLUCIÓN 001-2024", "ELECCIONES 2023", "BOGOTÁ D.C."],
    ["Leidy Tatiana Yepes Joya", "ACLARACIÓN DE VOTO", "RESOLUCIÓN 002-2024", "ELECCIONES 2023", "MEDELLÍN – ANTIOQUIA"],
    ["Angelica Johanna Bastidas Salgado", "SALVAMENTO DE VOTO", "RESOLUCIÓN 003-2024", "ELECCIONES 2023", "CALI – VALLE DEL CAUCA"],
  ];

  for (const s of salvamentos) {
    await connection.execute(
      `INSERT INTO expedientes (modulo, abogado, tema, sujeto, elecciones, lugar, createdAt, updatedAt)
       VALUES ('salvamentos',?,?,?,?,?,NOW(),NOW())`,
      s
    );
  }
  console.log(`  salvamentos: ${salvamentos.length} records`);

  // ARCHIVADOS
  const archivados = [
    ["Karen Ines Palacio Ferrer", "ARCHIVO DEFINITIVO", "EXPEDIENTE CERRADO", "ELECCIONES 2019", "BOGOTÁ D.C.", "Archivado"],
    ["Leidy Tatiana Yepes Joya", "ARCHIVO DEFINITIVO", "EXPEDIENTE CERRADO", "ELECCIONES 2019", "MEDELLÍN – ANTIOQUIA", "Archivado"],
    ["Angelica Johanna Bastidas Salgado", "ARCHIVO DEFINITIVO", "EXPEDIENTE CERRADO", "ELECCIONES 2019", "CALI – VALLE DEL CAUCA", "Archivado"],
    ["Diana Mercedes Vergara Llanos", "ARCHIVO DEFINITIVO", "EXPEDIENTE CERRADO", "ELECCIONES 2019", "BARRANQUILLA – ATLÁNTICO", "Archivado"],
    ["Julian David López Lovera", "ARCHIVO DEFINITIVO", "EXPEDIENTE CERRADO", "ELECCIONES 2019", "BUCARAMANGA – SANTANDER", "Archivado"],
  ];

  for (const a of archivados) {
    await connection.execute(
      `INSERT INTO expedientes (modulo, abogado, tema, sujeto, elecciones, lugar, estadoProceso, createdAt, updatedAt)
       VALUES ('archivados',?,?,?,?,?,?,NOW(),NOW())`,
      a
    );
  }
  console.log(`  archivados: ${archivados.length} records`);

  await connection.end();
  console.log("Seed complete!");
  process.exit(0);
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
