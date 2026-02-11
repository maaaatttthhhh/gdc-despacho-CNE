import ExpedienteModule from '@/components/ExpedienteModule';

// Columnas EXACTAS del Excel: ARCHIVADOS
// ABOGADO | TEMA | SUJETO | ELECCIONES Y/O CATEGORIA | LUGAR | No. RADICADO CNE |
// OF | IP | FC | P | AC | DF | R | FECHA RECIBIDO / REPARTO | DIAS EN DESPACHO | FECHA DE ARCHIVO | DIAS EN ETAPA
const columns = [
  { key: 'abogado', label: 'Abogado', width: '200px' },
  { key: 'tema', label: 'Tema', width: '280px' },
  { key: 'sujeto', label: 'Sujeto', width: '250px' },
  { key: 'elecciones', label: 'Elecciones y/o Categoría', width: '250px' },
  { key: 'lugar', label: 'Lugar', width: '200px' },
  { key: 'radicadoCne', label: 'No. Radicado CNE', width: '150px' },
  // ETAPAS con X/P
  { key: 'etapaOf', label: 'OF', width: '50px' },
  { key: 'etapaIp', label: 'IP', width: '50px' },
  { key: 'etapaFc', label: 'FC', width: '50px' },
  { key: 'etapaPr', label: 'P', width: '50px' },
  { key: 'etapaAc', label: 'AC', width: '50px' },
  { key: 'etapaDf', label: 'DF', width: '50px' },
  { key: 'etapaRc', label: 'R', width: '50px' },
  // Fechas y días
  { key: 'fechaRecibido', label: 'Fecha Recibido / Reparto', width: '160px' },
  { key: 'diasDespacho', label: 'Días en Despacho', width: '130px' },
  { key: 'fechaArchivo', label: 'Fecha de Archivo', width: '140px' },
  { key: 'diasEtapa', label: 'Días en Etapa', width: '120px' },
];

export default function Archivados() {
  return (
    <ExpedienteModule
      title="Expedientes Archivados"
      modulo="archivados"
      columns={columns}
      showSemaforo={false}
    />
  );
}
