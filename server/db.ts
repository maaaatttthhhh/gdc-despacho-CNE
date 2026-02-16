import { eq, and, like, sql, desc, asc, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, expedientes, autos, oficios, alertas, dashboardData } from "../drizzle/schema";
import type { InsertExpediente, InsertAuto, InsertOficio, InsertAlerta, InsertDashboardData } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ==================== USER FUNCTIONS ====================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    // Auto-assign appRole: owner gets 'administrador', others default to 'abogado'
    if (user.openId === ENV.ownerOpenId) {
      values.appRole = 'administrador';
      updateSet.appRole = 'administrador';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(asc(users.name));
}

export async function updateUserRole(userId: number, appRole: "magistrado" | "administrador" | "abogado") {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ appRole }).where(eq(users.id, userId));
}

export async function updateUserActive(userId: number, isActive: boolean) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ isActive }).where(eq(users.id, userId));
}

// ==================== EXPEDIENTE FUNCTIONS ====================

export async function getExpedientes(modulo: string, abogadoFilter?: string) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(expedientes.modulo, modulo as any)];
  if (abogadoFilter) {
    conditions.push(like(expedientes.abogado, `%${abogadoFilter}%`));
  }
  
  return db.select().from(expedientes)
    .where(conditions.length > 1 ? and(...conditions) : conditions[0])
    .orderBy(desc(expedientes.updatedAt));
}

export async function getExpedienteById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(expedientes).where(eq(expedientes.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createExpediente(data: InsertExpediente) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(expedientes).values(data);
  return result;
}

export async function updateExpediente(id: number, data: Partial<InsertExpediente>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(expedientes).set(data).where(eq(expedientes.id, id));
}

export async function deleteExpediente(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(expedientes).where(eq(expedientes.id, id));
}

// ==================== AUTOS FUNCTIONS ====================

export async function getAutos() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(autos).orderBy(desc(autos.updatedAt));
}

export async function createAuto(data: InsertAuto) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(autos).values(data);
}

export async function updateAuto(id: number, data: Partial<InsertAuto>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(autos).set(data).where(eq(autos.id, id));
}

export async function deleteAuto(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(autos).where(eq(autos.id, id));
}

// ==================== OFICIOS FUNCTIONS ====================

export async function getOficios() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(oficios).orderBy(desc(oficios.updatedAt));
}

export async function createOficio(data: InsertOficio) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(oficios).values(data);
}

export async function updateOficio(id: number, data: Partial<InsertOficio>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(oficios).set(data).where(eq(oficios.id, id));
}

export async function deleteOficio(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(oficios).where(eq(oficios.id, id));
}

// ==================== ALERTAS FUNCTIONS ====================

export async function getAlertas(destinatarioFilter?: string) {
  const db = await getDb();
  if (!db) return [];
  
  if (destinatarioFilter) {
    return db.select().from(alertas)
      .where(like(alertas.destinatarioNombre, `%${destinatarioFilter}%`))
      .orderBy(desc(alertas.createdAt));
  }
  return db.select().from(alertas).orderBy(desc(alertas.createdAt));
}

export async function createAlerta(data: InsertAlerta) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Insert alerta en BD
  const result = await db.insert(alertas).values(data);
  
  // Enviar correo si hay email de destinatario
  if (data.destinatarioEmail) {
    const { sendEmail, generateAlertEmailHTML } = await import('./_core/email');
    const html = generateAlertEmailHTML({
      tipo: data.tipo || 'informativo',
      mensaje: data.mensaje,
      modulo: data.modulo,
      expedienteRef: data.expedienteRef,
      destinatarioNombre: data.destinatarioNombre,
    });
    
    const emailSent = await sendEmail({
      to: data.destinatarioEmail,
      subject: `[${(data.tipo || 'informativo').toUpperCase()}] Alerta del Sistema de Gestión Documental`,
      html,
    });
    
    console.log(`[Alerta] Email ${emailSent ? 'sent' : 'failed'} to ${data.destinatarioEmail}`);
  }
  
  return result;
}

export async function updateAlertaEstado(id: number, estado: "pendiente" | "enviada" | "leida") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(alertas).set({ estado }).where(eq(alertas.id, id));
}

// ==================== DASHBOARD STATS ====================

export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return null;

  // Count by module
  const moduleCounts = await db.select({
    modulo: expedientes.modulo,
    total: count(),
  }).from(expedientes).groupBy(expedientes.modulo);

  // Count by abogado
  const abogadoCounts = await db.select({
    abogado: expedientes.abogado,
    total: count(),
  }).from(expedientes).groupBy(expedientes.abogado);

  // Semaforo stats (based on 'color' field from Excel)
  const semaforoStats = await db.select({
    color: expedientes.color,
  }).from(expedientes);

  let verde = 0, amarillo = 0, rojo = 0, archivado = 0;
  for (const row of semaforoStats) {
    const c = (row.color || '').toUpperCase();
    if (c === 'VERDE') verde++;
    else if (c === 'AMARILLO') amarillo++;
    else if (c === 'ROJO') rojo++;
    else if (c === 'ARCHIVADO') archivado++;
    else rojo++; // default to rojo for unknown
  }

  // Total records
  const totalExpedientes = moduleCounts.reduce((sum, m) => sum + m.total, 0);
  
  // Autos count
  const autosCount = await db.select({ total: count() }).from(autos);
  const oficiosCount = await db.select({ total: count() }).from(oficios);
  const alertasCount = await db.select({ total: count() }).from(alertas);

  return {
    moduleCounts: Object.fromEntries(moduleCounts.map(m => [m.modulo, m.total])),
    abogadoCounts: Object.fromEntries(abogadoCounts.filter(a => a.abogado).map(a => [a.abogado!, a.total])),
    semaforo: { verde, amarillo, rojo, archivado },
    totalExpedientes,
    totalAutos: autosCount[0]?.total || 0,
    totalOficios: oficiosCount[0]?.total || 0,
    totalAlertas: alertasCount[0]?.total || 0,
  };
}

// ==================== SEMÁFORO CONFIG ====================

import { semaforoConfig } from "../drizzle/schema";

export async function getSemaforoConfig() {
  const db = await getDb();
  if (!db) return { verdeMax: 30, amarilloMax: 90 };
  const result = await db.select().from(semaforoConfig).limit(1);
  if (result.length > 0) return result[0];
  return { id: 1, nombre: 'default', verdeMax: 30, amarilloMax: 90 };
}

export async function updateSemaforoConfig(verdeMax: number, amarilloMax: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(semaforoConfig).limit(1);
  if (existing.length > 0) {
    await db.update(semaforoConfig).set({ verdeMax, amarilloMax }).where(eq(semaforoConfig.id, existing[0].id));
  } else {
    await db.insert(semaforoConfig).values({ nombre: 'default', verdeMax, amarilloMax });
  }
}

// ==================== IMPORTACIÓN MASIVA ====================

export async function bulkDeleteExpedientes() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(expedientes);
}

export async function bulkInsertExpedientes(records: InsertExpediente[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Insert in batches of 50 to avoid query size limits
  for (let i = 0; i < records.length; i += 50) {
    const batch = records.slice(i, i + 50);
    await db.insert(expedientes).values(batch);
  }
  return records.length;
}

// ==================== DASHBOARD DATA ====================

export async function bulkDeleteDashboardData() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(dashboardData);
}

export async function bulkInsertDashboardData(records: InsertDashboardData[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Insert in batches of 50 to avoid query size limits
  for (let i = 0; i < records.length; i += 50) {
    const batch = records.slice(i, i + 50);
    await db.insert(dashboardData).values(batch);
  }
  return records.length;
}

export async function getDashboardDataStats() {
  const db = await getDb();
  if (!db) return null;

  const allData = await db.select().from(dashboardData);
  
  if (allData.length === 0) {
    // Fallback to expedientes if no dashboard_data
    return getDashboardStats();
  }

  // Count by color for semaforo
  let verde = 0, amarillo = 0, rojo = 0;
  for (const row of allData) {
    const color = (row.color || '').toLowerCase();
    if (color.includes('verde') || color === 'v') verde++;
    else if (color.includes('amarillo') || color === 'a') amarillo++;
    else if (color.includes('rojo') || color === 'r' || color === 'x') rojo++;
  }

  // Count by abogado
  const abogadoCounts: Record<string, number> = {};
  for (const row of allData) {
    if (row.abogado) {
      abogadoCounts[row.abogado] = (abogadoCounts[row.abogado] || 0) + 1;
    }
  }

  const totalExpedientes = allData.length;
  
  // Autos, oficios, alertas stay the same
  const autosCount = await db.select({ total: count() }).from(autos);
  const oficiosCount = await db.select({ total: count() }).from(oficios);
  const alertasCount = await db.select({ total: count() }).from(alertas);

  return {
    moduleCounts: {}, // No module breakdown in DATA PARA INFORME
    abogadoCounts,
    semaforo: { verde, amarillo, rojo, archivado: 0 },
    totalExpedientes,
    totalAutos: autosCount[0]?.total || 0,
    totalOficios: oficiosCount[0]?.total || 0,
    totalAlertas: alertasCount[0]?.total || 0,
  };
}
