import ExpedienteModule from '@/components/ExpedienteModule';

// Columnas EXACTAS del Excel: SALVAMENTOS Y ACLARACIONES PENDIENTES
// SALVAMENTOS: RESPONSABLE | PONENTE | EXPEDIENTE | No. RESOLUCIÓN | TEMA | SEMÁFORO/DÍAS EN DESPACHO | # VECES DEVUELTO | EN EL ABOGADO | DEVUELTO AL ABOGADO | DIANA RAMOS | DR LAUREANO | DR URIEL
// ACLARACIONES: RESPONSABLE | PONENTE | EXPEDIENTE | # EPX | No. RESOLUCIÓN | TEMA | SEMÁFORO/DÍAS EN DESPACHO | # VECES DEVUELTO | EN EL ABOGADO | DEVUELTO AL ABOGADO | DIANA RAMOS | DR LAUREANO | DR URIEL
const columns = [
  { key: 'tipoSalvamento', label: 'Tipo', width: '120px' },
  { key: 'abogado', label: 'Responsable', width: '200px' },
  { key: 'ponente', label: 'Ponente', width: '200px' },
  { key: 'radicadoCne', label: 'Expediente', width: '200px' },
  { key: 'resolucion', label: 'No. Resolución', width: '180px' },
  { key: 'tema', label: 'Tema', width: '400px' },
  { key: 'semaforoDias', label: 'Semáforo/Días en Despacho', width: '180px' },
  { key: 'devuelto', label: '# Veces Devuelto', width: '130px' },
  { key: 'enAbogado', label: 'En el Abogado', width: '120px' },
  { key: 'devueltoAbogado', label: 'Devuelto al Abogado', width: '140px' },
  { key: 'dianaRamos', label: 'Diana Ramos', width: '120px' },
  { key: 'drLaureano', label: 'Dr. Laureano', width: '120px' },
  { key: 'drUriel', label: 'Dr. Uriel', width: '120px' },
];

export default function Salvamentos() {
  return (
    <ExpedienteModule
      title="Salvamentos de Voto y Aclaraciones Pendientes"
      modulo="salvamentos"
      columns={columns}
      showSemaforo={true}
    />
  );
}
