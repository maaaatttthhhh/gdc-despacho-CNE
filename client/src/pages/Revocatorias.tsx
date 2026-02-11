import ExpedienteModule from '@/components/ExpedienteModule';

// Columnas EXACTAS del Excel: REVOCATORIAS
const columns = [
  { key: 'abogado', label: 'Abogado', width: '200px' },
  { key: 'tema', label: 'Tema', width: '280px' },
  { key: 'sujeto', label: 'Sujeto', width: '250px' },
  { key: 'elecciones', label: 'Elecciones y/o Categoría', width: '250px' },
  { key: 'lugar', label: 'Lugar', width: '200px' },
  { key: 'radicadoCne', label: 'No. Radicado CNE', width: '150px' },
  { key: 'etapaOf', label: 'Oficio', width: '70px' },
  { key: 'etapaIp', label: 'Ind. Preliminar', width: '110px' },
  { key: 'etapaFc', label: 'For. Cargos', width: '100px' },
  { key: 'etapaPr', label: 'Pruebas', width: '80px' },
  { key: 'etapaAc', label: 'Ale. Conclusión', width: '120px' },
  { key: 'etapaDf', label: 'Decisión Final', width: '110px' },
  { key: 'etapaRc', label: 'Recurso', width: '80px' },
  { key: 'fechaRecibido', label: 'Fecha Recibido / Reparto', width: '160px' },
  { key: 'fechaRepartoInterno', label: 'Fecha Reparto Interno', width: '160px' },
  { key: 'diasDespacho', label: 'Días en Despacho', width: '130px' },
  { key: 'diasAbogado', label: 'Días en Abogado', width: '130px' },
  { key: 'devuelto', label: '# Veces Devuelto', width: '130px' },
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

export default function Revocatorias() {
  return (
    <ExpedienteModule
      title="Revocatorias"
      modulo="revocatorias"
      columns={columns}
      showSemaforo={true}
    />
  );
}
