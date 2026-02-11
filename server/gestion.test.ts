import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Helper to create an authenticated admin context
function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-admin-user",
      email: "admin@test.com",
      name: "Admin Test",
      loginMethod: "manus",
      role: "admin",
      appRole: "administrador",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    } as any,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

// Helper to create an abogado context
function createAbogadoContext(name: string = "Test Abogado"): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "test-abogado-user",
      email: "abogado@test.com",
      name,
      loginMethod: "manus",
      role: "user",
      appRole: "abogado",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    } as any,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

// Helper for unauthenticated context
function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("auth.me", () => {
  it("returns user when authenticated", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeDefined();
    expect(result?.name).toBe("Admin Test");
    expect(result?.role).toBe("admin");
  });

  it("returns null when not authenticated", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });
});

describe("expedientes.list", () => {
  it("admin can list expedientes for any module", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.expedientes.list({ modulo: "procesos_practicas" });
    expect(Array.isArray(result)).toBe(true);
    // Admin should see all records
    expect(result.length).toBeGreaterThan(0);
  });

  it("admin can list inf_logos module", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.expedientes.list({ modulo: "inf_logos" });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("admin can list archivados module", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.expedientes.list({ modulo: "archivados" });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("abogado sees only their own expedientes", async () => {
    const ctx = createAbogadoContext("Karen Ines Palacio Ferrer");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.expedientes.list({ modulo: "procesos_practicas" });
    expect(Array.isArray(result)).toBe(true);
    // All results should belong to this abogado
    for (const exp of result) {
      expect(exp.abogado?.toUpperCase()).toContain("KAREN");
    }
  });

  it("unauthenticated user cannot list expedientes", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.expedientes.list({ modulo: "procesos_practicas" })).rejects.toThrow();
  });
});

describe("dashboard.stats", () => {
  it("admin can get dashboard stats", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.dashboard.stats();
    expect(result).toBeDefined();
    expect(result?.totalExpedientes).toBeGreaterThan(0);
    expect(result?.semaforo).toBeDefined();
    expect(result?.semaforo.verde).toBeGreaterThanOrEqual(0);
    expect(result?.semaforo.amarillo).toBeGreaterThanOrEqual(0);
    expect(result?.semaforo.rojo).toBeGreaterThanOrEqual(0);
    expect(result?.moduleCounts).toBeDefined();
  });

  it("unauthenticated user cannot get dashboard stats", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.dashboard.stats()).rejects.toThrow();
  });
});

describe("autos", () => {
  it("admin can list autos", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.autos.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("oficios", () => {
  it("admin can list oficios", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.oficios.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("alertas", () => {
  it("admin can list alertas", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.alertas.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("users (admin only)", () => {
  it("admin can list users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.users.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("abogado cannot list users", async () => {
    const ctx = createAbogadoContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.users.list()).rejects.toThrow();
  });

  it("unauthenticated user cannot list users", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.users.list()).rejects.toThrow();
  });
});

describe("semaforo config", () => {
  it("admin can get semaforo config", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.semaforo.get();
    expect(result).toBeDefined();
    expect(result.verdeMax).toBeGreaterThan(0);
    expect(result.amarilloMax).toBeGreaterThan(0);
    expect(result.amarilloMax).toBeGreaterThan(result.verdeMax);
  });

  it("admin can update semaforo config", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.semaforo.update({ verdeMax: 45, amarilloMax: 120 });
    expect(result.success).toBe(true);

    // Verify the update
    const updated = await caller.semaforo.get();
    expect(updated.verdeMax).toBe(45);
    expect(updated.amarilloMax).toBe(120);

    // Restore defaults
    await caller.semaforo.update({ verdeMax: 30, amarilloMax: 90 });
  });

  it("abogado cannot update semaforo config", async () => {
    const ctx = createAbogadoContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.semaforo.update({ verdeMax: 10, amarilloMax: 50 })).rejects.toThrow();
  });

  it("unauthenticated user cannot get semaforo config", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.semaforo.get()).rejects.toThrow();
  });
});

describe("importar (bulk import)", () => {
  it("admin can bulk import expedientes", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.importar.upload({
      records: [
        {
          modulo: "procesos_practicas",
          abogado: "Test Import",
          tema: "Test Tema",
          sujeto: "Test Sujeto",
          radicadoCne: "TEST-001",
        },
      ],
      replaceAll: false,
    });
    expect(result.success).toBe(true);
    expect(result.count).toBe(1);
  });

  it("abogado cannot bulk import", async () => {
    const ctx = createAbogadoContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.importar.upload({
        records: [
          {
            modulo: "procesos_practicas",
            abogado: "Test",
            tema: "Test",
          },
        ],
        replaceAll: false,
      })
    ).rejects.toThrow();
  });

  it("unauthenticated user cannot bulk import", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.importar.upload({
        records: [
          {
            modulo: "procesos_practicas",
            abogado: "Test",
          },
        ],
        replaceAll: false,
      })
    ).rejects.toThrow();
  });
});
