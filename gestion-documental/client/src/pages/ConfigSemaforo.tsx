import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Settings, Save, AlertTriangle, Info } from "lucide-react";

// ==================== DEFINICIÓN DE REGLAS ====================
// Cada regla define: columna, descripción, y rangos editables

interface SemaforoRule {
  id: string;
  label: string;
  description: string;
  module: string; // "general" | "salvamentos"
  hasYellow: boolean;
  defaults: { greenMin: number; greenMax: number; yellowMin?: number; yellowMax?: number; redMin: number };
}

const DEFAULT_RULES: SemaforoRule[] = [
  // === REGLAS GENERALES (todos los módulos excepto salvamentos) ===
  {
    id: "enEstudioAbogado",
    label: "En Estudio por el Abogado",
    description: "Diana Ramos, Dr. Laureano, Dr. Uriel",
    module: "general",
    hasYellow: true,
    defaults: { greenMin: 1, greenMax: 5, yellowMin: 6, yellowMax: 10, redMin: 11 },
  },
  {
    id: "devueltoEstudio",
    label: "Devuelto - En Estudio por el Abogado",
    description: "Número de veces devuelto",
    module: "general",
    hasYellow: false,
    defaults: { greenMin: 1, greenMax: 3, redMin: 4 },
  },
  {
    id: "enTerminos",
    label: "En Términos",
    description: "Días en términos del proceso",
    module: "general",
    hasYellow: false,
    defaults: { greenMin: -15, greenMax: 1, redMin: 2 },
  },
  {
    id: "notificacion",
    label: "Notificación (Continúa Proceso / Sigue Archivo)",
    description: "Días en notificación",
    module: "general",
    hasYellow: true,
    defaults: { greenMin: 1, greenMax: 15, yellowMin: 16, yellowMax: 20, redMin: 21 },
  },
  {
    id: "interponeRecurso",
    label: "Interpone Recurso - Archivo",
    description: "Días desde interposición de recurso",
    module: "general",
    hasYellow: false,
    defaults: { greenMin: -10, greenMax: 1, redMin: 2 },
  },
  // === REGLAS SALVAMENTOS ===
  {
    id: "salvAbogado",
    label: "Salvamentos: En el Abogado / Devuelto al Abogado",
    description: "Días en el abogado para salvamentos",
    module: "salvamentos",
    hasYellow: false,
    defaults: { greenMin: 1, greenMax: 2, redMin: 3 },
  },
  {
    id: "salvMagistrados",
    label: "Salvamentos: Diana Ramos, Dr. Laureano, Dr. Uriel",
    description: "Días en revisión por magistrados",
    module: "salvamentos",
    hasYellow: false,
    defaults: { greenMin: 1, greenMax: 1, redMin: 2 },
  },
];

interface RuleState {
  greenMin: number;
  greenMax: number;
  yellowMin?: number;
  yellowMax?: number;
  redMin: number;
}

export default function ConfigSemaforo() {
  const { data: config, isLoading } = trpc.semaforo.get.useQuery();
  const updateMutation = trpc.semaforo.update.useMutation();
  const utils = trpc.useUtils();

  // Estado del semáforo general (días en despacho)
  const [verdeMax, setVerdeMax] = useState(30);
  const [amarilloMax, setAmarilloMax] = useState(90);

  // Estado de las reglas por columna
  const [rules, setRules] = useState<Record<string, RuleState>>(() => {
    const initial: Record<string, RuleState> = {};
    for (const rule of DEFAULT_RULES) {
      initial[rule.id] = { ...rule.defaults };
    }
    return initial;
  });

  useEffect(() => {
    if (config) {
      setVerdeMax(config.verdeMax);
      setAmarilloMax(config.amarilloMax);
    }
  }, [config]);

  const updateRule = (id: string, field: keyof RuleState, value: number) => {
    setRules(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSave = async () => {
    if (verdeMax >= amarilloMax) {
      toast.error("El límite verde debe ser menor que el límite amarillo");
      return;
    }
    try {
      await updateMutation.mutateAsync({ verdeMax, amarilloMax });
      utils.semaforo.get.invalidate();
      utils.dashboard.stats.invalidate();
      // Las reglas por columna se guardan en localStorage por ahora
      localStorage.setItem("semaforoColumnRules", JSON.stringify(rules));
      toast.success("Configuración del semáforo actualizada correctamente");
    } catch (err) {
      toast.error("Error al actualizar la configuración");
    }
  };

  // Cargar reglas de localStorage al montar
  useEffect(() => {
    const saved = localStorage.getItem("semaforoColumnRules");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRules(prev => ({ ...prev, ...parsed }));
      } catch {}
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B3A5C]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-[#1B3A5C] flex items-center justify-center">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A5C]">Configuración del Semáforo</h1>
          <p className="text-sm text-gray-500">Ajuste los rangos de días para cada nivel del semáforo en todas las columnas</p>
        </div>
      </div>

      {/* ==================== SEMÁFORO GENERAL ==================== */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-6 mb-6">
        <h2 className="text-lg font-bold text-[#0C2340] border-b pb-3">Semáforo General (Días en Despacho)</h2>
        
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">Los cambios afectan el color del semáforo en el Dashboard y todos los módulos.</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
            <div className="w-8 h-8 rounded-full bg-green-500 mx-auto mb-2 shadow-[0_0_10px_rgba(34,197,94,0.4)]"></div>
            <p className="font-bold text-green-700 text-sm">VERDE</p>
            <div className="mt-2 flex items-center justify-center gap-1">
              <span className="text-xs text-green-600">0 –</span>
              <input
                type="number"
                value={verdeMax}
                onChange={(e) => setVerdeMax(Number(e.target.value))}
                min={1} max={365}
                className="w-16 px-2 py-1 border border-green-300 rounded text-center text-sm font-bold focus:ring-2 focus:ring-green-500 outline-none"
              />
              <span className="text-xs text-green-600">días</span>
            </div>
          </div>
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 text-center">
            <div className="w-8 h-8 rounded-full bg-yellow-500 mx-auto mb-2 shadow-[0_0_10px_rgba(234,179,8,0.4)]"></div>
            <p className="font-bold text-yellow-700 text-sm">AMARILLO</p>
            <div className="mt-2 flex items-center justify-center gap-1">
              <span className="text-xs text-yellow-600">{verdeMax + 1} –</span>
              <input
                type="number"
                value={amarilloMax}
                onChange={(e) => setAmarilloMax(Number(e.target.value))}
                min={verdeMax + 1} max={730}
                className="w-16 px-2 py-1 border border-yellow-300 rounded text-center text-sm font-bold focus:ring-2 focus:ring-yellow-500 outline-none"
              />
              <span className="text-xs text-yellow-600">días</span>
            </div>
          </div>
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-center">
            <div className="w-8 h-8 rounded-full bg-red-500 mx-auto mb-2 shadow-[0_0_10px_rgba(239,68,68,0.4)]"></div>
            <p className="font-bold text-red-700 text-sm">ROJO</p>
            <p className="mt-2 text-sm text-red-600 font-medium">&gt; {amarilloMax} días</p>
          </div>
        </div>
      </div>

      {/* ==================== REGLAS POR COLUMNA ==================== */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-6 mb-6">
        <div className="flex items-center gap-2 border-b pb-3">
          <h2 className="text-lg font-bold text-[#0C2340]">Reglas de Color por Columna</h2>
          <div className="group relative">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
            <div className="absolute left-0 top-6 bg-gray-800 text-white text-xs rounded-lg p-3 w-72 hidden group-hover:block z-50 shadow-lg">
              Estas reglas determinan el color de fondo de las celdas en las tablas de cada módulo. Los valores numéricos en cada columna se comparan con estos rangos.
            </div>
          </div>
        </div>

        {/* Reglas Generales */}
        <div>
          <h3 className="text-sm font-bold text-[#1B3A5C] uppercase tracking-wider mb-4">Módulos Generales</h3>
          <div className="space-y-4">
            {DEFAULT_RULES.filter(r => r.module === "general").map(rule => {
              const state = rules[rule.id];
              return (
                <div key={rule.id} className="border border-gray-200 rounded-lg p-4 hover:border-[#D4A843]/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-[#0C2340]">{rule.label}</h4>
                      <p className="text-xs text-gray-500">{rule.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {/* Verde */}
                    <div className="flex items-center gap-1 bg-green-50 rounded-lg px-3 py-2 border border-green-200">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-xs text-green-700 font-medium">Verde:</span>
                      <input
                        type="number"
                        value={state.greenMin}
                        onChange={(e) => updateRule(rule.id, "greenMin", Number(e.target.value))}
                        className="w-12 px-1 py-0.5 border border-green-300 rounded text-center text-xs font-bold outline-none focus:ring-1 focus:ring-green-500"
                      />
                      <span className="text-xs text-green-600">a</span>
                      <input
                        type="number"
                        value={state.greenMax}
                        onChange={(e) => updateRule(rule.id, "greenMax", Number(e.target.value))}
                        className="w-12 px-1 py-0.5 border border-green-300 rounded text-center text-xs font-bold outline-none focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                    {/* Amarillo (si aplica) */}
                    {rule.hasYellow && (
                      <div className="flex items-center gap-1 bg-yellow-50 rounded-lg px-3 py-2 border border-yellow-200">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span className="text-xs text-yellow-700 font-medium">Amarillo:</span>
                        <input
                          type="number"
                          value={state.yellowMin ?? 0}
                          onChange={(e) => updateRule(rule.id, "yellowMin", Number(e.target.value))}
                          className="w-12 px-1 py-0.5 border border-yellow-300 rounded text-center text-xs font-bold outline-none focus:ring-1 focus:ring-yellow-500"
                        />
                        <span className="text-xs text-yellow-600">a</span>
                        <input
                          type="number"
                          value={state.yellowMax ?? 0}
                          onChange={(e) => updateRule(rule.id, "yellowMax", Number(e.target.value))}
                          className="w-12 px-1 py-0.5 border border-yellow-300 rounded text-center text-xs font-bold outline-none focus:ring-1 focus:ring-yellow-500"
                        />
                      </div>
                    )}
                    {/* Rojo */}
                    <div className="flex items-center gap-1 bg-red-50 rounded-lg px-3 py-2 border border-red-200">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-xs text-red-700 font-medium">Rojo:</span>
                      <span className="text-xs text-red-600 font-bold">&ge; {state.redMin}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reglas Salvamentos */}
        <div>
          <h3 className="text-sm font-bold text-[#1B3A5C] uppercase tracking-wider mb-4">Salvamentos y Aclaraciones</h3>
          <div className="space-y-4">
            {DEFAULT_RULES.filter(r => r.module === "salvamentos").map(rule => {
              const state = rules[rule.id];
              return (
                <div key={rule.id} className="border border-gray-200 rounded-lg p-4 hover:border-[#D4A843]/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-[#0C2340]">{rule.label}</h4>
                      <p className="text-xs text-gray-500">{rule.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-1 bg-green-50 rounded-lg px-3 py-2 border border-green-200">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-xs text-green-700 font-medium">Verde:</span>
                      <input
                        type="number"
                        value={state.greenMin}
                        onChange={(e) => updateRule(rule.id, "greenMin", Number(e.target.value))}
                        className="w-12 px-1 py-0.5 border border-green-300 rounded text-center text-xs font-bold outline-none focus:ring-1 focus:ring-green-500"
                      />
                      <span className="text-xs text-green-600">a</span>
                      <input
                        type="number"
                        value={state.greenMax}
                        onChange={(e) => updateRule(rule.id, "greenMax", Number(e.target.value))}
                        className="w-12 px-1 py-0.5 border border-green-300 rounded text-center text-xs font-bold outline-none focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                    <div className="flex items-center gap-1 bg-red-50 rounded-lg px-3 py-2 border border-red-200">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-xs text-red-700 font-medium">Rojo:</span>
                      <span className="text-xs text-red-600 font-bold">&ge; {state.redMin}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ==================== BOTÓN GUARDAR ==================== */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="flex items-center gap-2 px-6 py-3 bg-[#1B3A5C] text-white rounded-lg hover:bg-[#2a4f7a] transition-colors font-semibold disabled:opacity-50 shadow-md"
        >
          <Save className="w-4 h-4" />
          {updateMutation.isPending ? "Guardando..." : "Guardar Toda la Configuración"}
        </button>
      </div>
    </div>
  );
}
