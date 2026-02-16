// ============================================================
// DASHBOARD - Panel principal con KPIs, semáforo y gráficas
// Conectado a la API de tRPC
// ============================================================
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { motion } from 'framer-motion';
import {
  FileText, Image, RotateCcw, ClipboardList, BookOpen, Archive, Gavel, Mail,
  AlertTriangle, CheckCircle2, Clock, Users, TrendingUp,
} from 'lucide-react';
import { Link } from 'wouter';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const HERO_BG = 'https://private-us-east-1.manuscdn.com/sessionFile/aEm6uIeWz7Le0iK77Kad95/sandbox/S2SRKR9KZj18zySGyPnjCM-img-2_1770700600000_na1fn_aGVyby1kYXNoYm9hcmQ.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvYUVtNnVJZVd6N0xlMGlLNzdLYWQ5NS9zYW5kYm94L1MyU1JLUjlLWmoxOHp5U0d5UG5qQ00taW1nLTJfMTc3MDcwMDYwMDAwMF9uYTFmbl9hR1Z5Ynkxa1lYTm9ZbTloY21RLmpwZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=sHL2xjxpfhGaKtbxIXAevwoNHMOVGfZHipvVIw~hAdc4GhBuQ-cV~PQtXdL2PASBXZFzGIc~LvqE8nBQYASGyu~aSq3ImHUgzhx4Z2xTceZGxiTtMtxS2V8OfeXHRhz83iFAN8jinuqrl~bIAiOFlHQK6~d3iWzgtVuA6T7T3Wd~9vez-Ry790iHlyj~3JGvp01pnbI7cMDglwV06TxZnGNIgo13DwgWRoLOZ2qmIPPhaV5jtex3DoS79wImiWwNHnC0ycT3in74U9wnSbpCD8KzYn4wLcYhV93Yo2ZFzIZ4U3K0kYhOTY6urI9R~5jZmSmrFlXjewI1V0Y5gQYACQ__';

const COLORS = ['#1B3A5C', '#D4A843', '#C8102E', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899', '#F97316', '#06B6D4', '#84CC16'];

const moduleLabels: Record<string, string> = {
  procesos_practicas: 'Procesos y Prácticas',
  inf_logos: 'Inf. Logos',
  revocatorias: 'Revocatorias',
  inf_ordinarios: 'Inf. Ordinarios',
  salvamentos: 'Salvamentos',
  archivados: 'Archivados',
};

const moduleIcons: Record<string, React.ElementType> = {
  procesos_practicas: FileText,
  inf_logos: Image,
  revocatorias: RotateCcw,
  inf_ordinarios: ClipboardList,
  salvamentos: BookOpen,
  archivados: Archive,
};

const moduleRoutes: Record<string, string> = {
  procesos_practicas: '/procesos-practicas',
  inf_logos: '/inf-logos',
  revocatorias: '/revocatorias',
  inf_ordinarios: '/inf-ordinarios',
  salvamentos: '/salvamentos',
  archivados: '/archivados',
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0, 0, 0.2, 1] as const },
  }),
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0C2340] text-white px-3 py-2 rounded-lg shadow-xl text-sm">
      <p className="font-semibold">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-[#D4A843]">{p.value} expedientes</p>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
const isLoading = false;

const stats = {
  moduleCounts: {
    procesos_practicas: 12,
    inf_logos: 8,
    revocatorias: 5,
    inf_ordinarios: 10,
    salvamentos: 4,
    archivados: 6,
  },
  abogadoCounts: {
    "Abogado 1": 15,
    "Abogado 2": 10,
    "Abogado 3": 8,
  },
  semaforo: {
    verde: 20,
    amarillo: 10,
    rojo: 5,
  },
  totalAutos: 18,
  totalOficios: 25,
  totalExpedientes: 45,
  totalAlertas: 3,
};


  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[#1B3A5C] border-t-transparent rounded-full" />
        <span className="ml-3 text-[#1B3A5C]/60">Cargando dashboard...</span>
      </div>
    );
  }

  // Prepare chart data
  const moduleChartData = Object.entries(stats.moduleCounts).map(([key, value]) => ({
    name: moduleLabels[key] || key,
    cantidad: value as number,
  }));

  const abogadoChartData = Object.entries(stats.abogadoCounts)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 10)
    .map(([key, value]) => ({
      nombre: key,
      cantidad: value as number,
    }));

  const semaforoItems = [
    { label: 'En Tiempo', sublabel: '0-30 días', color: '#22C55E', glow: 'rgba(34,197,94,0.3)', count: stats.semaforo.verde, icon: CheckCircle2 },
    { label: 'Precaución', sublabel: '31-90 días', color: '#EAB308', glow: 'rgba(234,179,8,0.3)', count: stats.semaforo.amarillo, icon: Clock },
    { label: 'Crítico', sublabel: '90+ días', color: '#EF4444', glow: 'rgba(239,68,68,0.3)', count: stats.semaforo.rojo, icon: AlertTriangle },
  ];

  const semaforoPieData = [
    { name: 'Normal (≤30d)', value: stats.semaforo.verde, color: '#22C55E' },
    { name: 'Precaución (31-90d)', value: stats.semaforo.amarillo, color: '#EAB308' },
    { name: 'Crítico (>90d)', value: stats.semaforo.rojo, color: '#EF4444' },
  ];

  const totalSemaforo = stats.semaforo.verde + stats.semaforo.amarillo + stats.semaforo.rojo;

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-xl overflow-hidden shadow-lg"
      >
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${HERO_BG})` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0C2340]/95 via-[#1B3A5C]/85 to-[#0C2340]/70" />
        <div className="relative px-6 py-8 lg:py-10">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full border-3 border-[#D4A843]/50 bg-[#1B3A5C] flex items-center justify-center overflow-hidden flex-shrink-0 shadow-xl">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#D4A843]/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-[#D4A843]/60" />
              </div>
            </div>
            <div>
              <p className="text-[#D4A843] text-xs font-semibold uppercase tracking-widest mb-1">
                Despacho del Magistrado
              </p>
              <h2 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                Benjamín Ortiz Torres
              </h2>
              <p className="text-white/60 text-sm mt-1">
                Consejo Nacional Electoral &middot; Software de Gestión Documental
              </p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[3px] flex">
          <div className="flex-1 bg-[#1B3A5C]" />
          <div className="flex-1 bg-[#D4A843]" />
          <div className="flex-1 bg-[#C8102E]" />
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {Object.entries(stats.moduleCounts).map(([key, value], i) => {
          const Icon = moduleIcons[key] || FileText;
          const route = moduleRoutes[key] || '/';
          return (
            <motion.div key={key} custom={i} initial="hidden" animate="visible" variants={cardVariants}>
              <Link href={route}>
                <div className="bg-white rounded-xl shadow-sm border border-[#1B3A5C]/8 p-4 hover:shadow-md hover:border-[#D4A843]/30 transition-all duration-200 group cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[#1B3A5C]/5 flex items-center justify-center group-hover:bg-[#D4A843]/10 transition-colors">
                      <Icon className="w-4 h-4 text-[#1B3A5C] group-hover:text-[#D4A843] transition-colors" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-[#0C2340]">{value}</p>
                  <p className="text-xs text-[#1B3A5C]/60 mt-0.5 truncate">{moduleLabels[key] || key}</p>
                </div>
              </Link>
            </motion.div>
          );
        })}
        <motion.div custom={6} initial="hidden" animate="visible" variants={cardVariants}>
          <Link href="/autos">
            <div className="bg-white rounded-xl shadow-sm border border-[#1B3A5C]/8 p-4 hover:shadow-md hover:border-[#D4A843]/30 transition-all duration-200 group cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#D4A843]/8 flex items-center justify-center group-hover:bg-[#D4A843]/15 transition-colors">
                  <Gavel className="w-4 h-4 text-[#D4A843]" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#0C2340]">{stats.totalAutos}</p>
              <p className="text-xs text-[#1B3A5C]/60 mt-0.5 truncate">Autos</p>
            </div>
          </Link>
        </motion.div>
        <motion.div custom={7} initial="hidden" animate="visible" variants={cardVariants}>
          <Link href="/oficios">
            <div className="bg-white rounded-xl shadow-sm border border-[#1B3A5C]/8 p-4 hover:shadow-md hover:border-[#D4A843]/30 transition-all duration-200 group cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#C8102E]/8 flex items-center justify-center group-hover:bg-[#C8102E]/15 transition-colors">
                  <Mail className="w-4 h-4 text-[#C8102E]" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#0C2340]">{stats.totalOficios}</p>
              <p className="text-xs text-[#1B3A5C]/60 mt-0.5 truncate">Oficios</p>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Semáforo */}
        <motion.div custom={0} initial="hidden" animate="visible" variants={cardVariants}>
          <div className="bg-white rounded-xl shadow-sm border border-[#1B3A5C]/8 p-5">
            <h3 className="text-sm font-bold text-[#0C2340] uppercase tracking-wider mb-4 flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-[#D4A843]" />
              Semáforo de Gestión
            </h3>
            <div className="space-y-3">
              {semaforoItems.map((item, i) => (
                <motion.div
                  key={item.label}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={cardVariants}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/80 hover:bg-gray-50 transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${item.color}15`, boxShadow: `0 0 12px ${item.glow}` }}
                  >
                    <div
                      className="w-4 h-4 rounded-full animate-pulse"
                      style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.glow}` }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-[#0C2340]">{item.label}</span>
                      <span className="text-lg font-bold" style={{ color: item.color }}>{item.count}</span>
                    </div>
                    <span className="text-xs text-[#1B3A5C]/50">{item.sublabel}</span>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-[#1B3A5C]/8">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#1B3A5C]/60">Total expedientes</span>
                <span className="font-bold text-[#0C2340]">{stats.totalExpedientes}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bar Chart - Por Módulo */}
        <motion.div custom={1} initial="hidden" animate="visible" variants={cardVariants}
          className="bg-white rounded-xl shadow-sm border border-[#1B3A5C]/8 p-5 lg:col-span-2"
        >
          <h3 className="text-sm font-bold text-[#0C2340] uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-[#1B3A5C]" />
            Expedientes por Módulo
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moduleChartData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="cantidad" radius={[6, 6, 0, 0]}>
                  {moduleChartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie Chart - Semáforo */}
        <motion.div custom={2} initial="hidden" animate="visible" variants={cardVariants}
          className="bg-white rounded-xl shadow-sm border border-[#1B3A5C]/8 p-5"
        >
          <h3 className="text-sm font-bold text-[#0C2340] uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-[#C8102E]" />
            Distribución del Semáforo
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={semaforoPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  nameKey="name"
                  paddingAngle={2}
                >
                  {semaforoPieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [`${value} exp.`, name]}
                  contentStyle={{ backgroundColor: '#0C2340', color: 'white', borderRadius: '8px', border: 'none' }}
                  itemStyle={{ color: '#D4A843' }}
                />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', lineHeight: '20px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Horizontal Bar - Por Abogado */}
        <motion.div custom={3} initial="hidden" animate="visible" variants={cardVariants}
          className="bg-white rounded-xl shadow-sm border border-[#1B3A5C]/8 p-5"
        >
          <h3 className="text-sm font-bold text-[#0C2340] uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-[#D4A843]" />
            Carga por Abogado
          </h3>
          <div className="space-y-2.5">
            {abogadoChartData.map((item, i) => {
              const maxVal = abogadoChartData[0]?.cantidad || 1;
              const pct = (item.cantidad / maxVal) * 100;
              return (
                <div key={i} className="group">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#1B3A5C]/70 truncate max-w-[60%]">{item.nombre}</span>
                    <span className="font-semibold text-[#0C2340]">{item.cantidad}</span>
                  </div>
                  <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.05 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Total Summary */}
      <motion.div custom={4} initial="hidden" animate="visible" variants={cardVariants}
        className="bg-gradient-to-r from-[#0C2340] to-[#1B3A5C] rounded-xl p-6 text-white shadow-lg"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold text-[#D4A843]">{stats.totalExpedientes}</p>
            <p className="text-sm text-white/60">Total Expedientes</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#D4A843]">{stats.totalAutos}</p>
            <p className="text-sm text-white/60">Total Autos</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#D4A843]">{stats.totalOficios}</p>
            <p className="text-sm text-white/60">Total Oficios</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#D4A843]">{stats.totalAlertas}</p>
            <p className="text-sm text-white/60">Alertas Activas</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
