// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/db.ts
import { eq, and, like, desc, asc, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
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
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var expedientes = mysqlTable("expedientes", {
  id: int("id").autoincrement().primaryKey(),
  modulo: mysqlEnum("modulo", [
    "procesos_practicas",
    "inf_logos",
    "revocatorias",
    "inf_ordinarios",
    "salvamentos",
    "archivados"
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var autos = mysqlTable("autos", {
  id: int("id").autoincrement().primaryKey(),
  numeroAuto: varchar("numeroAuto", { length: 20 }).notNull(),
  fecha: varchar("fecha", { length: 30 }),
  radicado: varchar("radicado", { length: 50 }),
  asunto: text("asunto"),
  asesor: text("asesor"),
  asesorUserId: int("asesorUserId"),
  enlace: text("enlace"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var oficios = mysqlTable("oficios", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var alertas = mysqlTable("alertas", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var semaforoConfig = mysqlTable("semaforo_config", {
  id: int("id").autoincrement().primaryKey(),
  nombre: varchar("nombre", { length: 50 }).notNull().unique(),
  verdeMax: int("verdeMax").default(30).notNull(),
  amarilloMax: int("amarilloMax").default(90).notNull(),
  // Rojo = todo lo que supere amarilloMax
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/db.ts
var _db = null;
async function getDb() {
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
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (user.openId === ENV.ownerOpenId) {
      values.appRole = "administrador";
      updateSet.appRole = "administrador";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(asc(users.name));
}
async function updateUserRole(userId, appRole) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ appRole }).where(eq(users.id, userId));
}
async function updateUserActive(userId, isActive) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ isActive }).where(eq(users.id, userId));
}
async function getExpedientes(modulo, abogadoFilter) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(expedientes.modulo, modulo)];
  if (abogadoFilter) {
    conditions.push(like(expedientes.abogado, `%${abogadoFilter}%`));
  }
  return db.select().from(expedientes).where(conditions.length > 1 ? and(...conditions) : conditions[0]).orderBy(desc(expedientes.updatedAt));
}
async function getExpedienteById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(expedientes).where(eq(expedientes.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createExpediente(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(expedientes).values(data);
  return result;
}
async function updateExpediente(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(expedientes).set(data).where(eq(expedientes.id, id));
}
async function deleteExpediente(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(expedientes).where(eq(expedientes.id, id));
}
async function getAutos() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(autos).orderBy(desc(autos.updatedAt));
}
async function createAuto(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(autos).values(data);
}
async function updateAuto(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(autos).set(data).where(eq(autos.id, id));
}
async function deleteAuto(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(autos).where(eq(autos.id, id));
}
async function getOficios() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(oficios).orderBy(desc(oficios.updatedAt));
}
async function createOficio(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(oficios).values(data);
}
async function updateOficio(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(oficios).set(data).where(eq(oficios.id, id));
}
async function deleteOficio(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(oficios).where(eq(oficios.id, id));
}
async function getAlertas(destinatarioFilter) {
  const db = await getDb();
  if (!db) return [];
  if (destinatarioFilter) {
    return db.select().from(alertas).where(like(alertas.destinatarioNombre, `%${destinatarioFilter}%`)).orderBy(desc(alertas.createdAt));
  }
  return db.select().from(alertas).orderBy(desc(alertas.createdAt));
}
async function createAlerta(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(alertas).values(data);
}
async function updateAlertaEstado(id, estado) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(alertas).set({ estado }).where(eq(alertas.id, id));
}
async function getDashboardStats() {
  const db = await getDb();
  if (!db) return null;
  const moduleCounts = await db.select({
    modulo: expedientes.modulo,
    total: count()
  }).from(expedientes).groupBy(expedientes.modulo);
  const abogadoCounts = await db.select({
    abogado: expedientes.abogado,
    total: count()
  }).from(expedientes).groupBy(expedientes.abogado);
  const semaforoStats = await db.select({
    color: expedientes.color
  }).from(expedientes);
  let verde = 0, amarillo = 0, rojo = 0, archivado = 0;
  for (const row of semaforoStats) {
    const c = (row.color || "").toUpperCase();
    if (c === "VERDE") verde++;
    else if (c === "AMARILLO") amarillo++;
    else if (c === "ROJO") rojo++;
    else if (c === "ARCHIVADO") archivado++;
    else rojo++;
  }
  const totalExpedientes = moduleCounts.reduce((sum, m) => sum + m.total, 0);
  const autosCount = await db.select({ total: count() }).from(autos);
  const oficiosCount = await db.select({ total: count() }).from(oficios);
  const alertasCount = await db.select({ total: count() }).from(alertas);
  return {
    moduleCounts: Object.fromEntries(moduleCounts.map((m) => [m.modulo, m.total])),
    abogadoCounts: Object.fromEntries(abogadoCounts.filter((a) => a.abogado).map((a) => [a.abogado, a.total])),
    semaforo: { verde, amarillo, rojo, archivado },
    totalExpedientes,
    totalAutos: autosCount[0]?.total || 0,
    totalOficios: oficiosCount[0]?.total || 0,
    totalAlertas: alertasCount[0]?.total || 0
  };
}
async function getSemaforoConfig() {
  const db = await getDb();
  if (!db) return { verdeMax: 30, amarilloMax: 90 };
  const result = await db.select().from(semaforoConfig).limit(1);
  if (result.length > 0) return result[0];
  return { id: 1, nombre: "default", verdeMax: 30, amarilloMax: 90 };
}
async function updateSemaforoConfig(verdeMax, amarilloMax) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(semaforoConfig).limit(1);
  if (existing.length > 0) {
    await db.update(semaforoConfig).set({ verdeMax, amarilloMax }).where(eq(semaforoConfig.id, existing[0].id));
  } else {
    await db.insert(semaforoConfig).values({ nombre: "default", verdeMax, amarilloMax });
  }
}
async function bulkDeleteExpedientes() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(expedientes);
}
async function bulkInsertExpedientes(records) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  for (let i = 0; i < records.length; i += 50) {
    const batch = records.slice(i, i + 50);
    await db.insert(expedientes).values(batch);
  }
  return records.length;
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
import { z as z2 } from "zod";
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    })
  }),
  // ==================== EXPEDIENTES ====================
  expedientes: router({
    list: protectedProcedure.input(z2.object({
      modulo: z2.string(),
      abogadoFilter: z2.string().optional()
    })).query(async ({ input, ctx }) => {
      const user = ctx.user;
      const filter = user.appRole === "abogado" ? user.name || void 0 : input.abogadoFilter;
      return getExpedientes(input.modulo, filter ?? void 0);
    }),
    getById: protectedProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
      return getExpedienteById(input.id);
    }),
    create: protectedProcedure.input(z2.object({
      modulo: z2.enum(["procesos_practicas", "inf_logos", "revocatorias", "inf_ordinarios", "salvamentos", "archivados"]),
      abogado: z2.string().optional(),
      tema: z2.string().optional(),
      sujeto: z2.string().optional(),
      elecciones: z2.string().optional(),
      lugar: z2.string().optional(),
      radicadoCne: z2.string().optional(),
      observaciones: z2.string().optional(),
      diasDespacho: z2.number().optional()
    })).mutation(async ({ input }) => {
      return createExpediente(input);
    }),
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      abogado: z2.string().optional(),
      tema: z2.string().optional(),
      sujeto: z2.string().optional(),
      elecciones: z2.string().optional(),
      lugar: z2.string().optional(),
      radicadoCne: z2.string().optional(),
      observaciones: z2.string().optional(),
      diasDespacho: z2.number().optional(),
      enEstudioAbogado: z2.string().optional(),
      devueltoEstudio: z2.string().optional(),
      dianaRamos: z2.string().optional(),
      drLaureano: z2.string().optional(),
      drUriel: z2.string().optional(),
      enTerminos: z2.string().optional(),
      enSala: z2.string().optional(),
      enFirmas: z2.string().optional(),
      notifContinuaProceso: z2.string().optional(),
      notifSigueArchivo: z2.string().optional(),
      interponeRecursoArchivo: z2.string().optional(),
      pausa: z2.string().optional(),
      estadoProceso: z2.string().optional(),
      ubicacionActual: z2.string().optional()
    })).mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      if (ctx.user.appRole === "abogado") {
        const exp = await getExpedienteById(id);
        if (exp && exp.abogado !== ctx.user.name) {
          throw new Error("No tiene permisos para editar este expediente");
        }
      }
      return updateExpediente(id, data);
    }),
    delete: adminProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
      return deleteExpediente(input.id);
    })
  }),
  // ==================== AUTOS ====================
  autos: router({
    list: protectedProcedure.query(async () => {
      return getAutos();
    }),
    create: protectedProcedure.input(z2.object({
      numeroAuto: z2.string(),
      fecha: z2.string().optional(),
      radicado: z2.string().optional(),
      asunto: z2.string().optional(),
      asesor: z2.string().optional(),
      enlace: z2.string().optional()
    })).mutation(async ({ input }) => {
      return createAuto(input);
    }),
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      numeroAuto: z2.string().optional(),
      fecha: z2.string().optional(),
      radicado: z2.string().optional(),
      asunto: z2.string().optional(),
      asesor: z2.string().optional(),
      enlace: z2.string().optional()
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateAuto(id, data);
    }),
    delete: adminProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
      return deleteAuto(input.id);
    })
  }),
  // ==================== OFICIOS ====================
  oficios: router({
    list: protectedProcedure.query(async () => {
      return getOficios();
    }),
    create: protectedProcedure.input(z2.object({
      noOficio: z2.string(),
      fecha: z2.string().optional(),
      radicado: z2.string().optional(),
      destinatario: z2.string().optional(),
      asunto: z2.string().optional(),
      responsable: z2.string().optional(),
      estado: z2.enum(["Pendiente", "Enviado", "Recibido", "Archivado"]).optional(),
      enlace: z2.string().optional()
    })).mutation(async ({ input }) => {
      return createOficio(input);
    }),
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      noOficio: z2.string().optional(),
      fecha: z2.string().optional(),
      radicado: z2.string().optional(),
      destinatario: z2.string().optional(),
      asunto: z2.string().optional(),
      responsable: z2.string().optional(),
      estado: z2.enum(["Pendiente", "Enviado", "Recibido", "Archivado"]).optional(),
      enlace: z2.string().optional()
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateOficio(id, data);
    }),
    delete: adminProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
      return deleteOficio(input.id);
    })
  }),
  // ==================== ALERTAS ====================
  alertas: router({
    list: protectedProcedure.input(z2.object({ destinatarioFilter: z2.string().optional() }).optional()).query(async ({ input, ctx }) => {
      const filter = ctx.user.appRole === "abogado" ? ctx.user.name || void 0 : input?.destinatarioFilter;
      return getAlertas(filter ?? void 0);
    }),
    create: protectedProcedure.input(z2.object({
      tipo: z2.enum(["critico", "precaucion", "informativo"]),
      destinatarioNombre: z2.string().optional(),
      destinatarioEmail: z2.string().optional(),
      modulo: z2.string().optional(),
      expedienteRef: z2.string().optional(),
      mensaje: z2.string().optional()
    })).mutation(async ({ input }) => {
      return createAlerta({
        ...input,
        estado: "pendiente",
        moduloAlerta: input.modulo
      });
    }),
    updateEstado: protectedProcedure.input(z2.object({
      id: z2.number(),
      estado: z2.enum(["pendiente", "enviada", "leida"])
    })).mutation(async ({ input }) => {
      return updateAlertaEstado(input.id, input.estado);
    })
  }),
  // ==================== DASHBOARD ====================
  dashboard: router({
    stats: protectedProcedure.query(async () => {
      return getDashboardStats();
    })
  }),
  // ==================== SEMÁFORO CONFIG ====================
  semaforo: router({
    get: protectedProcedure.query(async () => {
      return getSemaforoConfig();
    }),
    update: adminProcedure.input(z2.object({
      verdeMax: z2.number().min(1).max(365),
      amarilloMax: z2.number().min(1).max(730)
    })).mutation(async ({ input }) => {
      await updateSemaforoConfig(input.verdeMax, input.amarilloMax);
      return { success: true };
    })
  }),
  // ==================== IMPORTACIÓN MASIVA ====================
  importar: router({
    upload: adminProcedure.input(z2.object({
      records: z2.array(z2.object({
        modulo: z2.enum(["procesos_practicas", "inf_logos", "revocatorias", "inf_ordinarios", "salvamentos", "archivados"]),
        abogado: z2.string().optional(),
        tema: z2.string().optional(),
        sujeto: z2.string().optional(),
        elecciones: z2.string().optional(),
        lugar: z2.string().optional(),
        radicadoCne: z2.string().optional(),
        etapaOf: z2.string().optional(),
        etapaIp: z2.string().optional(),
        etapaFc: z2.string().optional(),
        etapaPr: z2.string().optional(),
        etapaAc: z2.string().optional(),
        etapaDf: z2.string().optional(),
        etapaRc: z2.string().optional(),
        etapa: z2.string().optional(),
        estado: z2.string().optional(),
        fechaRecibido: z2.string().optional(),
        diasDespacho: z2.number().optional(),
        diasEtapa: z2.number().optional(),
        devuelto: z2.number().optional(),
        enEstudioAbogado: z2.string().optional(),
        devueltoEstudio: z2.string().optional(),
        dianaRamos: z2.string().optional(),
        drLaureano: z2.string().optional(),
        drUriel: z2.string().optional(),
        enTerminos: z2.string().optional(),
        enSala: z2.string().optional(),
        enFirmas: z2.string().optional(),
        notifContinuaProceso: z2.string().optional(),
        notifSigueArchivo: z2.string().optional(),
        interponeRecursoArchivo: z2.string().optional(),
        pausa: z2.string().optional(),
        observaciones: z2.string().optional(),
        color: z2.string().optional(),
        anio: z2.number().optional(),
        fechaArchivo: z2.string().optional(),
        tipoSalvamento: z2.string().optional(),
        ponente: z2.string().optional(),
        resolucion: z2.string().optional(),
        semaforoDias: z2.number().optional(),
        enAbogado: z2.string().optional(),
        devueltoAbogado: z2.string().optional(),
        numero: z2.number().optional()
      })),
      replaceAll: z2.boolean().default(false)
    })).mutation(async ({ input }) => {
      if (input.replaceAll) {
        await bulkDeleteExpedientes();
      }
      const count2 = await bulkInsertExpedientes(input.records);
      return { success: true, count: count2 };
    })
  }),
  // ==================== ADMIN: USER MANAGEMENT ====================
  users: router({
    list: adminProcedure.query(async () => {
      return getAllUsers();
    }),
    updateRole: adminProcedure.input(z2.object({
      userId: z2.number(),
      appRole: z2.enum(["magistrado", "administrador", "abogado"])
    })).mutation(async ({ input }) => {
      return updateUserRole(input.userId, input.appRole);
    }),
    toggleActive: adminProcedure.input(z2.object({
      userId: z2.number(),
      isActive: z2.boolean()
    })).mutation(async ({ input }) => {
      return updateUserActive(input.userId, input.isActive);
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs2 from "fs";
import { nanoid } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var PROJECT_ROOT = import.meta.dirname;
var LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
var MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024;
var TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6);
function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}
function trimLogFile(logPath, maxSize) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }
    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines = [];
    let keptBytes = 0;
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}
`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }
    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
  }
}
function writeToLogFile(source, entries) {
  if (entries.length === 0) return;
  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);
  const lines = entries.map((entry) => {
    const ts = (/* @__PURE__ */ new Date()).toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });
  fs.appendFileSync(logPath, `${lines.join("\n")}
`, "utf-8");
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}
function vitePluginManusDebugCollector() {
  return {
    name: "manus-debug-collector",
    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true
            },
            injectTo: "head"
          }
        ]
      };
    },
    configureServer(server) {
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }
        const handlePayload = (payload) => {
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };
        const reqBody = req.body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    }
  };
}
var plugins = [react(), tailwindcss(), vitePluginManusRuntime(), vitePluginManusDebugCollector()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
