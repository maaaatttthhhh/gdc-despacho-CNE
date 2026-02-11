import ExpedienteModule from '@/components/ExpedienteModule';

// Columnas EXACTAS del Excel: PROCESOS Y PRACTICAS
// ABOGADO | TEMA | SUJETO | ELECCIONES | LUGAR | No. RADICADO CNE | ETAPA (OF|IP|FC|PR|AC|DF|RC) |
// FECHA RECIBIDO / REPARTO | DIAS EN DESPACHO | DIAS EN ETAPA | # VECES DEVUELTO |
// EN ESTUDIO POR EL ABOGADO | DEVUELTO - EN ESTUDIO POR EL ABOGADO | DIANA RAMOS | DR LAUREANO | DR URIEL |
// EN TÉRMINOS | EN SALA | EN FIRMAS | EN NOTIFICACIÓN CONTINUA PROCESO | EN NOTIFICACIÓN SIGUE ARCHIVO |
// INTERPONE RECURSO - ARCHIVO | PAUSA | OBSERVACIONES
const columns = [
  { key: 'abogado', label: 'Abogado', width: '200px' },
  { key: 'tema', label: 'Tema', width: '280px' },
  { key: 'sujeto', label: 'Sujeto', width: '250px' },
  { key: 'elecciones', label: 'Elecciones', width: '250px' },
  { key: 'lugar', label: 'Lugar', width: '200px' },
  { key: 'radicadoCne', label: 'No. Radicado CNE', width: '150px' },
  // ETAPAS con X/P
  { key: 'etapaOf', label: 'OF', width: '50px' },
  { key: 'etapaIp', label: 'IP', width: '50px' },
  { key: 'etapaFc', label: 'FC', width: '50px' },
  { key: 'etapaPr', label: 'PR', width: '50px' },
  { key: 'etapaAc', label: 'AC', width: '50px' },
  { key: 'etapaDf', label: 'DF', width: '50px' },
  { key: 'etapaRc', label: 'RC', width: '50px' },
  // Fechas y días
  { key: 'fechaRecibido', label: 'Fecha Recibido / Reparto', width: '160px' },
  { key: 'diasDespacho', label: 'Días en Despacho', width: '130px' },
  { key: 'diasEtapa', label: 'Días en Etapa', width: '120px' },
  { key: 'devuelto', label: '# Veces Devuelto', width: '130px' },
  // Semáforo
  { key: 'enEstudioAbogado', label: 'En Estudio por el Abogado', width: '170px' },
  { key: 'devueltoEstudio', label: 'Devuelto - En Estudio por el Abogado', width: '200px' },
  { key: 'dianaRamos', label: 'Diana Ramos', width: '120px' },
  { key: 'drLaureano', label: 'Dr. Laureano', width: '120px' },
  { key: 'drUriel', label: 'Dr. Uriel', width: '120px' },
  { key: 'enTerminos', label: 'En Términos', width: '120px' },
  { key: 'enSala', label: 'En Sala', width: '100px' },
  { key: 'enFirmas', label: 'En Firmas', width: '100px' },
  { key: 'notifContinuaProceso', label: 'En Notificación Continúa Proceso', width: '200px' },
  { key: 'notifSigueArchivo', label: 'En Notificación Sigue Archivo', width: '200px' },
  { key: 'interponeRecursoArchivo', label: 'Interpone Recurso - Archivo', width: '180px' },
  { key: 'pausa', label: 'Pausa', width: '100px' },
  { key: 'observaciones', label: 'Observaciones', width: '300px' },
];

export default function ProcesosPracticas() {
  return (
    <ExpedienteModule
      title="Procesos y Prácticas Organizativas"
      modulo="procesos_practicas"
      columns={columns}
      showSemaforo={true}
    />
  );
}
