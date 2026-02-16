import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with custom role for Gestión Documental.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  appRole: mysqlEnum("appRole", ["magistrado", "administrador", "abogado"]).default("abogado").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Expedientes - stores all records from all modules.
 * The `modulo` field determines which module the record belongs to.
 */
export const expedientes = mysqlTable("expedientes", {
  id: int("id").autoincrement().primaryKey(),
  modulo: mysqlEnum("modulo", [
    "procesos_practicas",
    "inf_logos",
    "revocatorias",
    "inf_ordinarios",
    "salvamentos",
    "archivados",
  ]).notNull(),
  numero: int("numero"),
  abogado: text("abogado"),
  abogadoUserId: int("abogadoUserId"),
  tema: text("tema"),
  sujeto: text("sujeto"),
  elecciones: text("elecciones"),
  lugar: text("lugar"),
  radicadoCne: varchar("radicadoCne", { length: 100 }),
  proceso: varchar("proceso", { length: 100 }),
  referencia: text("referencia"),
  fechaRadicado: varchar("fechaRadicado", { length: 30 }),
  // Etapas (OF, IP, FC, PR/P, AC, DF, RC/R) - X or P marks
  etapaOf: varchar("etapaOf", { length: 20 }),
  etapaIp: varchar("etapaIp", { length: 20 }),
  etapaFc: varchar("etapaFc", { length: 20 }),
  etapaPr: varchar("etapaPr", { length: 20 }),
  etapaAc: varchar("etapaAc", { length: 20 }),
  etapaDf: varchar("etapaDf", { length: 20 }),
  etapaRc: varchar("etapaRc", { length: 20 }),
  // Etapa and Estado from DATA PARA INFORME
  etapa: text("etapa"),
  estado: text("estado"),
  inicioTerminos: text("inicioTerminos"),
  fechaRecibido: varchar("fechaRecibido", { length: 30 }),
  diasDespacho: int("diasDespacho"),
  diasEtapa: int("diasEtapa"),
  diasEtapaCurso: int("diasEtapaCurso"),
  devuelto: int("devuelto"),
  // Columnas de seguimiento / semáforo
  enEstudioAbogado: varchar("enEstudioAbogado", { length: 50 }),
  devueltoEstudio: varchar("devueltoEstudio", { length: 50 }),
  dianaRamos: varchar("dianaRamos", { length: 50 }),
  drLaureano: varchar("drLaureano", { length: 50 }),
  drUriel: varchar("drUriel", { length: 50 }),
  enTerminos: varchar("enTerminos", { length: 50 }),
  enSala: varchar("enSala", { length: 50 }),
  enFirmas: varchar("enFirmas", { length: 50 }),
  notifContinuaProceso: varchar("notifContinuaProceso", { length: 50 }),
  notifSigueArchivo: varchar("notifSigueArchivo", { length: 50 }),
  interponeRecursoArchivo: varchar("interponeRecursoArchivo", { length: 50 }),
  pausa: varchar("pausa", { length: 50 }),
  archivadoDespacho: varchar("archivadoDespacho", { length: 50 }),
  observaciones: text("observaciones"),
  // Campos extra
  estadoProceso: varchar("estadoProceso", { length: 100 }),
  ubicacionActual: varchar("ubicacionActual", { length: 200 }),
  fechaVencimiento: varchar("fechaVencimiento", { length: 30 }),
  fechaArchivo: varchar("fechaArchivo", { length: 30 }),
  tema2: varchar("tema2", { length: 100 }),
  anio: int("anio"),
  color: varchar("color", { length: 20 }),
  abogadoProcesosVivos: text("abogadoProcesosVivos"),
  // Campos adicionales para Revocatorias
  fechaRepartoInterno: varchar("fechaRepartoInterno", { length: 30 }),
  diasAbogado: int("diasAbogado"),
  // Campos adicionales para Salvamentos y Aclaraciones
  tipoSalvamento: varchar("tipoSalvamento", { length: 30 }),
  ponente: text("ponente"),
  resolucion: text("resolucion"),
  semaforoDias: int("semaforoDias"),
  enAbogado: varchar("enAbogado", { length: 50 }),
  devueltoAbogado: varchar("devueltoAbogado", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Expediente = typeof expedientes.$inferSelect;
export type InsertExpediente = typeof expedientes.$inferInsert;

/**
 * Autos - legal orders/decisions
 */
export const autos = mysqlTable("autos", {
  id: int("id").autoincrement().primaryKey(),
  numeroAuto: varchar("numeroAuto", { length: 20 }).notNull(),
  fecha: varchar("fecha", { length: 30 }),
  radicado: varchar("radicado", { length: 50 }),
  asunto: text("asunto"),
  asesor: text("asesor"),
  asesorUserId: int("asesorUserId"),
  enlace: text("enlace"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Auto = typeof autos.$inferSelect;
export type InsertAuto = typeof autos.$inferInsert;

/**
 * Oficios - official correspondence
 */
export const oficios = mysqlTable("oficios", {
  id: int("id").autoincrement().primaryKey(),
  noOficio: varchar("noOficio", { length: 20 }).notNull(),
  fecha: varchar("fecha", { length: 30 }),
  radicado: varchar("radicado", { length: 50 }),
  destinatario: text("destinatario"),
  asunto: text("asunto"),
  responsable: text("responsable"),
  responsableUserId: int("responsableUserId"),
  estado: mysqlEnum("estadoOficio", ["Pendiente", "Enviado", "Recibido", "Archivado"]).default("Pendiente").notNull(),
  enlace: text("enlace"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Oficio = typeof oficios.$inferSelect;
export type InsertOficio = typeof oficios.$inferInsert;

/**
 * Alertas - notifications sent to lawyers
 */
export const alertas = mysqlTable("alertas", {
  id: int("id").autoincrement().primaryKey(),
  tipo: mysqlEnum("tipo", ["critico", "precaucion", "informativo"]).default("informativo").notNull(),
  estado: mysqlEnum("estadoAlerta", ["pendiente", "enviada", "leida"]).default("pendiente").notNull(),
  destinatarioUserId: int("destinatarioUserId"),
  destinatarioNombre: text("destinatarioNombre"),
  destinatarioEmail: varchar("destinatarioEmail", { length: 320 }),
  modulo: varchar("moduloAlerta", { length: 50 }),
  expedienteRef: varchar("expedienteRef", { length: 100 }),
  mensaje: text("mensaje"),
  fechaEnvio: timestamp("fechaEnvio"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Alerta = typeof alertas.$inferSelect;
export type InsertAlerta = typeof alertas.$inferInsert;

/**
 * Configuración del semáforo - parámetros editables
 */
export const semaforoConfig = mysqlTable("semaforo_config", {
  id: int("id").autoincrement().primaryKey(),
  nombre: varchar("nombre", { length: 50 }).notNull().unique(),
  verdeMax: int("verdeMax").default(30).notNull(),
  amarilloMax: int("amarilloMax").default(90).notNull(),
  // Rojo = todo lo que supere amarilloMax
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SemaforoConfig = typeof semaforoConfig.$inferSelect;
export type InsertSemaforoConfig = typeof semaforoConfig.$inferInsert;

/**
 * Dashboard Data - datos consolidados desde "DATA PARA INFORME"
 * Esta tabla almacena los datos reales para el dashboard
 */
export const dashboardData = mysqlTable("dashboard_data", {
  id: int("id").autoincrement().primaryKey(),
  numero: int("numero"),
  radicadoCne: varchar("radicadoCne", { length: 100 }),
  proceso: varchar("proceso", { length: 100 }),
  tema: text("tema"),
  fechaRadicado: varchar("fechaRadicado", { length: 30 }),
  lugar: text("lugar"),
  solicitante: text("solicitante"),
  referencia: text("referencia"),
  abogado: text("abogado"),
  fechaRecibido: varchar("fechaRecibido", { length: 30 }),
  diasDespacho: int("diasDespacho"),
  color: varchar("color", { length: 20 }), // Verde, Amarillo, Rojo
  etapa: varchar("etapa", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DashboardData = typeof dashboardData.$inferSelect;
export type InsertDashboardData = typeof dashboardData.$inferInsert;
