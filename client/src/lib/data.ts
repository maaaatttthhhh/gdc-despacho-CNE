// ============================================================
// DATA STORE - Software de Gestión Documental CNE
// Estilo: Despacho Ejecutivo - Colores institucionales CNE
// ============================================================

export interface ProcesoRecord {
  ABOGADO: string;
  TEMA: string;
  SUJETO: string;
  ELECCIONES_CATEGORIA: string;
  LUGAR: string;
  RADICADO_CNE: string;
  OFICIO: string;
  IND_PRELIMINAR: string;
  FOR_CARGOS: string;
  PRUEBAS: string;
  ALE_CONCLUSION: string;
  DECISION_FINAL: string;
  RECURSO: string;
  FECHA_RECIBIDO: string;
  DIAS_DESPACHO: string;
  DIAS_ETAPA: string;
  VECES_DEVUELTO: string;
  EN_ESTUDIO_ABOGADO: string;
  DEVUELTO_ESTUDIO: string;
  DIANA_RAMOS: string;
  DR_LAUREANO: string;
  DR_URIEL: string;
  EN_TERMINOS: string;
  EN_SALA: string;
  EN_FIRMAS: string;
  EN_NOTIF_CONTINUA: string;
  EN_NOTIF_ARCHIVO: string;
  INTERPONE_RECURSO: string;
  PAUSA: string;
  OBSERVACIONES: string;
}

export interface RevocatoriaRecord extends ProcesoRecord {
  FECHA_REPARTO: string;
  DIAS_ABOGADO: string;
}

export interface SalvamentoRecord {
  NUM: string;
  RESPONSABLE: string;
  PONENTE: string;
  EXPEDIENTE: string;
  NUM_RESOLUCION: string;
  TEMA: string;
  SEMAFORO_DIAS: string;
  VECES_DEVUELTO: string;
  EN_ABOGADO: string;
  DEVUELTO_ABOGADO: string;
  DIANA_RAMOS: string;
  DR_LAUREANO: string;
  DR_URIEL: string;
}

export interface ArchivadoRecord {
  NUM: string;
  ABOGADO: string;
  TEMA: string;
  SUJETO: string;
  ELECCIONES_CATEGORIA: string;
  LUGAR: string;
  RADICADO_CNE: string;
  OF: string;
  IP: string;
  FC: string;
  P: string;
  AC: string;
  DF: string;
  R: string;
  FECHA_RECIBIDO: string;
  DIAS_DESPACHO: string;
  FECHA_ARCHIVO: string;
  DIAS_ETAPA: string;
}

export type ModuleKey = 'procesos_practicas' | 'inf_logos' | 'revocatorias' | 'inf_ordinarios' | 'salvamentos' | 'archivados';

export interface DashboardStats {
  porAnio: { anio: string; cantidad: number }[];
  porAbogado: { nombre: string; cantidad: number }[];
  porEtapa: { etapa: string; cantidad: number }[];
  porEstado: { estado: string; cantidad: number }[];
  porUbicacion: { ubicacion: string; cantidad: number }[];
  totalProcesos: number;
}

export function getSemaforoColor(dias: number): 'green' | 'yellow' | 'red' {
  if (dias <= 30) return 'green';
  if (dias <= 90) return 'yellow';
  return 'red';
}

export function getSemaforoLabel(color: 'green' | 'yellow' | 'red'): string {
  switch (color) {
    case 'green': return 'En tiempo';
    case 'yellow': return 'Precaución';
    case 'red': return 'Crítico';
  }
}

export const dashboardStats: DashboardStats = {
  porAnio: [
    { anio: '2022', cantidad: 56 },
    { anio: '2023', cantidad: 1011 },
    { anio: '2024', cantidad: 86 },
    { anio: '2025', cantidad: 892 },
    { anio: '2026', cantidad: 3 },
  ],
  porAbogado: [
    { nombre: 'Karen Ines Palacio Ferrer', cantidad: 265 },
    { nombre: 'Leidy Tatiana Yepes Joya', cantidad: 251 },
    { nombre: 'Angelica J. Bastidas S.', cantidad: 229 },
    { nombre: 'Diana M. Vergara Llanos', cantidad: 203 },
    { nombre: 'Carlos A. Salazar Galindo', cantidad: 98 },
    { nombre: 'Diana M. Ramos Duque', cantidad: 98 },
    { nombre: 'Lina A. Sarmiento B.', cantidad: 93 },
    { nombre: 'Juan C. Barrera E.', cantidad: 83 },
    { nombre: 'Julian D. López Lovera', cantidad: 82 },
    { nombre: 'Daniela Arcila Restrepo', cantidad: 72 },
  ],
  porEtapa: [
    { etapa: 'Ordinario', cantidad: 936 },
    { etapa: 'Procesos y Prácticas', cantidad: 304 },
    { etapa: 'Ordinario - Revocatoria', cantidad: 15 },
  ],
  porEstado: [
    { estado: 'Archivado en Despacho', cantidad: 710 },
    { estado: 'Decisión Final', cantidad: 75 },
    { estado: 'Pendiente Archivar', cantidad: 74 },
    { estado: 'Pendiente Definir', cantidad: 54 },
    { estado: 'Recurso', cantidad: 12 },
    { estado: 'Formulación de Cargos', cantidad: 8 },
    { estado: 'Oficios', cantidad: 8 },
    { estado: 'Pausa', cantidad: 5 },
    { estado: 'Pruebas', cantidad: 5 },
    { estado: 'Indagación Preliminar', cantidad: 3 },
  ],
  porUbicacion: [
    { ubicacion: 'En Estudio por Abogado', cantidad: 76 },
    { ubicacion: 'Interpone Recurso - Archivo', cantidad: 75 },
    { ubicacion: 'Notificación Sigue Archivo', cantidad: 49 },
    { ubicacion: 'Devuelto - Estudio Abogado', cantidad: 9 },
    { ubicacion: 'En Sala', cantidad: 8 },
    { ubicacion: 'En Firmas', cantidad: 8 },
    { ubicacion: 'Pausa', cantidad: 5 },
    { ubicacion: 'Notif. Continua Proceso', cantidad: 5 },
    { ubicacion: 'En Términos', cantidad: 3 },
    { ubicacion: 'Diana Ramos', cantidad: 3 },
  ],
  totalProcesos: 2059,
};

export const moduleLabels: Record<ModuleKey, string> = {
  procesos_practicas: 'Procesos y Prácticas',
  inf_logos: 'Inf. Logos',
  revocatorias: 'Revocatorias',
  inf_ordinarios: 'Inf. Ordinarios',
  salvamentos: 'Salvamentos y Aclaraciones',
  archivados: 'Archivados',
};

export const moduleDescriptions: Record<ModuleKey, string> = {
  procesos_practicas: 'Registro de logos de procesos y prácticas organizativas',
  inf_logos: 'Informes de registro de logosímbolos',
  revocatorias: 'Revocatorias de inscripción',
  inf_ordinarios: 'Investigaciones e informes ordinarios',
  salvamentos: 'Salvamentos de voto y aclaraciones pendientes',
  archivados: 'Expedientes archivados',
};

export const moduleCounts: Record<ModuleKey, number> = {
  procesos_practicas: 47,
  inf_logos: 51,
  revocatorias: 16,
  inf_ordinarios: 125,
  salvamentos: 16,
  archivados: 728,
};
