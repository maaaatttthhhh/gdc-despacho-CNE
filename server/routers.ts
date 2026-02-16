import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getExpedientes, getExpedienteById, createExpediente, updateExpediente, deleteExpediente,
  getAutos, createAuto, updateAuto, deleteAuto,
  getOficios, createOficio, updateOficio, deleteOficio,
  getAlertas, createAlerta, updateAlertaEstado,
  getDashboardStats,
  getAllUsers, updateUserRole, updateUserActive,
  getSemaforoConfig, updateSemaforoConfig,
  bulkDeleteExpedientes, bulkInsertExpedientes,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ==================== EXPEDIENTES ====================
  expedientes: router({
    list: protectedProcedure
      .input(z.object({
        modulo: z.string(),
        abogadoFilter: z.string().optional(),
      }))
      .query(async ({ input, ctx }) => {
        const user = ctx.user;
        // If user is abogado, filter by their name
        const filter = user.appRole === "abogado" ? user.name || undefined : input.abogadoFilter;
        return getExpedientes(input.modulo, filter ?? undefined);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getExpedienteById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        modulo: z.enum(["procesos_practicas", "inf_logos", "revocatorias", "inf_ordinarios", "salvamentos", "archivados"]),
        abogado: z.string().optional(),
        tema: z.string().optional(),
        sujeto: z.string().optional(),
        elecciones: z.string().optional(),
        lugar: z.string().optional(),
        radicadoCne: z.string().optional(),
        observaciones: z.string().optional(),
        diasDespacho: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return createExpediente(input);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        abogado: z.string().optional(),
        tema: z.string().optional(),
        sujeto: z.string().optional(),
        elecciones: z.string().optional(),
        lugar: z.string().optional(),
        radicadoCne: z.string().optional(),
        observaciones: z.string().optional(),
        diasDespacho: z.number().optional(),
        enEstudioAbogado: z.string().optional(),
        devueltoEstudio: z.string().optional(),
        dianaRamos: z.string().optional(),
        drLaureano: z.string().optional(),
        drUriel: z.string().optional(),
        enTerminos: z.string().optional(),
        enSala: z.string().optional(),
        enFirmas: z.string().optional(),
        notifContinuaProceso: z.string().optional(),
        notifSigueArchivo: z.string().optional(),
        interponeRecursoArchivo: z.string().optional(),
        pausa: z.string().optional(),
        estadoProceso: z.string().optional(),
        ubicacionActual: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        // Abogados can only update their own expedientes
        if (ctx.user.appRole === "abogado") {
          const exp = await getExpedienteById(id);
          if (exp && exp.abogado !== ctx.user.name) {
            throw new Error("No tiene permisos para editar este expediente");
          }
        }
        return updateExpediente(id, data);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return deleteExpediente(input.id);
      }),
  }),

  // ==================== AUTOS ====================
  autos: router({
    list: protectedProcedure.query(async () => {
      return getAutos();
    }),

    create: protectedProcedure
      .input(z.object({
        numeroAuto: z.string(),
        fecha: z.string().optional(),
        radicado: z.string().optional(),
        asunto: z.string().optional(),
        asesor: z.string().optional(),
        enlace: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return createAuto(input);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        numeroAuto: z.string().optional(),
        fecha: z.string().optional(),
        radicado: z.string().optional(),
        asunto: z.string().optional(),
        asesor: z.string().optional(),
        enlace: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return updateAuto(id, data);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return deleteAuto(input.id);
      }),
  }),

  // ==================== OFICIOS ====================
  oficios: router({
    list: protectedProcedure.query(async () => {
      return getOficios();
    }),

    create: protectedProcedure
      .input(z.object({
        noOficio: z.string(),
        fecha: z.string().optional(),
        radicado: z.string().optional(),
        destinatario: z.string().optional(),
        asunto: z.string().optional(),
        responsable: z.string().optional(),
        estado: z.enum(["Pendiente", "Enviado", "Recibido", "Archivado"]).optional(),
        enlace: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return createOficio(input);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        noOficio: z.string().optional(),
        fecha: z.string().optional(),
        radicado: z.string().optional(),
        destinatario: z.string().optional(),
        asunto: z.string().optional(),
        responsable: z.string().optional(),
        estado: z.enum(["Pendiente", "Enviado", "Recibido", "Archivado"]).optional(),
        enlace: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return updateOficio(id, data);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return deleteOficio(input.id);
      }),
  }),

  // ==================== ALERTAS ====================
  alertas: router({
    list: protectedProcedure
      .input(z.object({ destinatarioFilter: z.string().optional() }).optional())
      .query(async ({ input, ctx }) => {
        const filter = ctx.user.appRole === "abogado" ? ctx.user.name || undefined : input?.destinatarioFilter;
        return getAlertas(filter ?? undefined);
      }),

    create: protectedProcedure
      .input(z.object({
        tipo: z.enum(["critico", "precaucion", "informativo"]),
        destinatarioNombre: z.string().optional(),
        destinatarioEmail: z.string().optional(),
        modulo: z.string().optional(),
        expedienteRef: z.string().optional(),
        mensaje: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return createAlerta({
          tipo: input.tipo,
          destinatarioNombre: input.destinatarioNombre,
          destinatarioEmail: input.destinatarioEmail,
          modulo: input.modulo,
          expedienteRef: input.expedienteRef,
          mensaje: input.mensaje,
          estado: "pendiente",
        });
      }),

    updateEstado: protectedProcedure
      .input(z.object({
        id: z.number(),
        estado: z.enum(["pendiente", "enviada", "leida"]),
      }))
      .mutation(async ({ input }) => {
        return updateAlertaEstado(input.id, input.estado);
      }),
  }),

  // ==================== DASHBOARD ====================
  dashboard: router({
    stats: protectedProcedure.query(async () => {
      return getDashboardStats();
    }),
  }),

  // ==================== SEMÁFORO CONFIG ====================
  semaforo: router({
    get: protectedProcedure.query(async () => {
      return getSemaforoConfig();
    }),

    update: adminProcedure
      .input(z.object({
        verdeMax: z.number().min(1).max(365),
        amarilloMax: z.number().min(1).max(730),
      }))
      .mutation(async ({ input }) => {
        await updateSemaforoConfig(input.verdeMax, input.amarilloMax);
        return { success: true };
      }),
  }),

  // ==================== IMPORTACIÓN MASIVA ====================
  importar: router({
    upload: adminProcedure
      .input(z.object({
        records: z.array(z.object({
          modulo: z.enum(["procesos_practicas", "inf_logos", "revocatorias", "inf_ordinarios", "salvamentos", "archivados"]),
          abogado: z.string().optional(),
          tema: z.string().optional(),
          sujeto: z.string().optional(),
          elecciones: z.string().optional(),
          lugar: z.string().optional(),
          radicadoCne: z.string().optional(),
          etapaOf: z.string().optional(),
          etapaIp: z.string().optional(),
          etapaFc: z.string().optional(),
          etapaPr: z.string().optional(),
          etapaAc: z.string().optional(),
          etapaDf: z.string().optional(),
          etapaRc: z.string().optional(),
          etapa: z.string().optional(),
          estado: z.string().optional(),
          fechaRecibido: z.string().optional(),
          diasDespacho: z.number().optional(),
          diasEtapa: z.number().optional(),
          devuelto: z.number().optional(),
          enEstudioAbogado: z.string().optional(),
          devueltoEstudio: z.string().optional(),
          dianaRamos: z.string().optional(),
          drLaureano: z.string().optional(),
          drUriel: z.string().optional(),
          enTerminos: z.string().optional(),
          enSala: z.string().optional(),
          enFirmas: z.string().optional(),
          notifContinuaProceso: z.string().optional(),
          notifSigueArchivo: z.string().optional(),
          interponeRecursoArchivo: z.string().optional(),
          pausa: z.string().optional(),
          observaciones: z.string().optional(),
          color: z.string().optional(),
          anio: z.number().optional(),
          fechaArchivo: z.string().optional(),
          tipoSalvamento: z.string().optional(),
          ponente: z.string().optional(),
          resolucion: z.string().optional(),
          semaforoDias: z.number().optional(),
          enAbogado: z.string().optional(),
          devueltoAbogado: z.string().optional(),
          numero: z.number().optional(),
        })),
        replaceAll: z.boolean().default(false),
      }))
      .mutation(async ({ input }) => {
        if (input.replaceAll) {
          await bulkDeleteExpedientes();
        }
        const count = await bulkInsertExpedientes(input.records as any);
        return { success: true, count };
      }),
  }),

  // ==================== ADMIN: USER MANAGEMENT ====================
  users: router({
    list: adminProcedure.query(async () => {
      return getAllUsers();
    }),

    updateRole: adminProcedure
      .input(z.object({
        userId: z.number(),
        appRole: z.enum(["magistrado", "administrador", "abogado"]),
      }))
      .mutation(async ({ input }) => {
        return updateUserRole(input.userId, input.appRole);
      }),

    toggleActive: adminProcedure
      .input(z.object({
        userId: z.number(),
        isActive: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        return updateUserActive(input.userId, input.isActive);
      }),
  }),
});

export type AppRouter = typeof appRouter;
