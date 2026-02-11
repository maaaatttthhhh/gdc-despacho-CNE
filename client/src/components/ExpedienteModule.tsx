// ============================================================
// EXPEDIENTE MODULE - Componente genérico para módulos de expedientes
// Conecta con la API de tRPC para CRUD de expedientes
// ============================================================
import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { Search, Edit2, Save, X, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ColumnDef {
  key: string;
  label: string;
  width?: string;
  editable?: boolean;
}

interface ExpedienteModuleProps {
  title: string;
  modulo: string;
  columns: ColumnDef[];
  showSemaforo?: boolean;
}

// ==================== UTILIDADES ====================

// Convierte serial de Excel (ej: 45875) a fecha legible dd/mm/yy
function excelSerialToDate(val: any): string {
  if (val === null || val === undefined || val === '' || val === '-') return '—';
  const str = String(val).trim();
  // Si ya tiene formato de fecha (contiene /) retornar tal cual
  if (str.includes('/') || str.includes('-') && str.length > 5) return str;
  // Si es un número (serial de Excel)
  const num = Number(str);
  if (!isNaN(num) && num > 40000 && num < 60000) {
    const epoch = new Date(1899, 11, 30);
    const date = new Date(epoch.getTime() + num * 86400000);
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear().toString().slice(-2);
    return `${d}/${m}/${y}`;
  }
  return str;
}

// Columnas que contienen fechas
const DATE_COLUMNS = new Set([
  'fechaRecibido', 'fechaArchivo', 'fechaRadicado', 'fechaVencimiento',
  'fechaRepartoInterno', 'inicioTerminos'
]);

// ==================== REGLAS DE COLOR POR COLUMNA ====================
// Reglas de semáforo condicional según las instrucciones del usuario
type ColorRule = { green: [number, number]; yellow?: [number, number]; red: [number, number] };

const COLUMN_COLOR_RULES: Record<string, ColorRule> = {
  // En Estudio Abogado, Diana Ramos, Dr Laureano, Dr Uriel: 1-5 verde, 5-10 amarillo, >10 rojo
  enEstudioAbogado: { green: [1, 5], yellow: [6, 10], red: [11, 99999] },
  dianaRamos: { green: [1, 5], yellow: [6, 10], red: [11, 99999] },
  drLaureano: { green: [1, 5], yellow: [6, 10], red: [11, 99999] },
  drUriel: { green: [1, 5], yellow: [6, 10], red: [11, 99999] },
  // Devuelto - En estudio por el abogado: 1-3 verde, >3 rojo
  devueltoEstudio: { green: [1, 3], red: [4, 99999] },
  // En Términos: -15 a 1 verde, >1 rojo
  enTerminos: { green: [-15, 1], red: [2, 99999] },
  // Notificación continúa proceso / sigue archivo: 1-15 verde, 15-20 amarillo, >20 rojo
  notifContinuaProceso: { green: [1, 15], yellow: [16, 20], red: [21, 99999] },
  notifSigueArchivo: { green: [1, 15], yellow: [16, 20], red: [21, 99999] },
  // Interpone recurso - archivo: -10 a 1 verde, >1 rojo
  interponeRecursoArchivo: { green: [-10, 1], red: [2, 99999] },
};

// Reglas especiales para Salvamentos
const SALVAMENTO_COLOR_RULES: Record<string, ColorRule> = {
  // Abogado (enAbogado): 1-2 verde, >2 rojo
  enAbogado: { green: [1, 2], red: [3, 99999] },
  devueltoAbogado: { green: [1, 2], red: [3, 99999] },
  // Diana Ramos, Dr Laureano, Dr Uriel: 1 verde, >1 rojo
  dianaRamos: { green: [1, 1], red: [2, 99999] },
  drLaureano: { green: [1, 1], red: [2, 99999] },
  drUriel: { green: [1, 1], red: [2, 99999] },
};

function getCellColorClass(key: string, value: any, modulo: string): string {
  if (value === null || value === undefined || value === '' || value === '-' || value === '—') return '';
  const num = Number(String(value).trim());
  if (isNaN(num) || num === 0) return '';

  const rules = modulo === 'salvamentos' && SALVAMENTO_COLOR_RULES[key]
    ? SALVAMENTO_COLOR_RULES[key]
    : COLUMN_COLOR_RULES[key];

  if (!rules) return '';

  if (num >= rules.green[0] && num <= rules.green[1]) {
    return 'bg-green-100 text-green-800';
  }
  if (rules.yellow && num >= rules.yellow[0] && num <= rules.yellow[1]) {
    return 'bg-yellow-100 text-yellow-800';
  }
  if (num >= rules.red[0] && num <= rules.red[1]) {
    return 'bg-red-100 text-red-800';
  }
  return '';
}

// ==================== COMPONENTE ====================

export default function ExpedienteModule({ title, modulo, columns, showSemaforo = false }: ExpedienteModuleProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Record<string, any>>({});
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRecord, setNewRecord] = useState<Record<string, any>>({});

  const isAdmin = user?.role === 'admin' || (user as any)?.appRole === 'magistrado' || (user as any)?.appRole === 'administrador';

  const { data: expedientes, isLoading, refetch } = trpc.expedientes.list.useQuery({
    modulo,
  });

  const updateMutation = trpc.expedientes.update.useMutation({
    onSuccess: () => {
      toast.success('Expediente actualizado correctamente');
      setEditingId(null);
      setEditData({});
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || 'Error al actualizar');
    },
  });

  const createMutation = trpc.expedientes.create.useMutation({
    onSuccess: () => {
      toast.success('Expediente creado correctamente');
      setShowAddForm(false);
      setNewRecord({});
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || 'Error al crear');
    },
  });

  // Filter data
  const filteredData = useMemo(() => {
    if (!expedientes) return [];
    if (!searchTerm) return expedientes;
    const lower = searchTerm.toLowerCase();
    return expedientes.filter((row: any) =>
      columns.some(col => {
        const val = row[col.key];
        return val && String(val).toLowerCase().includes(lower);
      })
    );
  }, [expedientes, searchTerm, columns]);

  // Semaforo color based on 'color' field from Excel
  const getSemaforoColor = (row: any) => {
    const color = (row.color || '').toUpperCase();
    if (color === 'VERDE') return 'bg-green-100 text-green-800 border-green-300';
    if (color === 'AMARILLO') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (color === 'ROJO') return 'bg-red-100 text-red-800 border-red-300';
    if (color === 'ARCHIVADO') return 'bg-gray-100 text-gray-600 border-gray-300';
    const dias = row.diasDespacho || 0;
    if (dias <= 30) return 'bg-green-100 text-green-800 border-green-300';
    if (dias <= 90) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getSemaforoDot = (row: any) => {
    const color = (row.color || '').toUpperCase();
    if (color === 'VERDE') return 'bg-green-500';
    if (color === 'AMARILLO') return 'bg-yellow-500';
    if (color === 'ROJO') return 'bg-red-500';
    if (color === 'ARCHIVADO') return 'bg-gray-400';
    const dias = row.diasDespacho || 0;
    if (dias <= 30) return 'bg-green-500';
    if (dias <= 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSemaforoLabel = (row: any) => {
    const color = (row.color || '').toUpperCase();
    if (color === 'VERDE') return 'En Tiempo';
    if (color === 'AMARILLO') return 'Precaución';
    if (color === 'ROJO') return 'Crítico';
    if (color === 'ARCHIVADO') return 'Archivado';
    return row.diasDespacho ? `${row.diasDespacho}d` : '—';
  };

  const startEdit = (row: any) => {
    setEditingId(row.id);
    setEditData({ ...row });
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateMutation.mutate({ id: editingId, ...editData });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleCreate = () => {
    createMutation.mutate({
      modulo: modulo as any,
      ...newRecord,
    });
  };

  // Render cell value
  const renderCellValue = (value: any, key: string) => {
    if (value === null || value === undefined) return '—';
    const strVal = String(value);
    if (strVal === '-' || strVal === '') return '—';

    // Convertir fechas de serial Excel
    if (DATE_COLUMNS.has(key)) {
      return excelSerialToDate(value);
    }

    // For etapa columns, show X/P badges
    const etapaCols = ['etapaOf', 'etapaIp', 'etapaFc', 'etapaPr', 'etapaAc', 'etapaDf', 'etapaRc'];
    if (etapaCols.includes(key)) {
      const upper = strVal.toUpperCase().trim();
      if (upper === 'X' || upper === 'P' || upper === 'X/X') {
        return (
          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
            upper === 'P' ? 'bg-orange-100 text-orange-700 border border-orange-300' : 'bg-blue-100 text-blue-700 border border-blue-300'
          }`}>
            {upper}
          </span>
        );
      }
    }

    // For color column
    if (key === 'color') {
      const upper = strVal.toUpperCase();
      const colorClass = upper === 'VERDE' ? 'bg-green-100 text-green-700' :
                         upper === 'AMARILLO' ? 'bg-yellow-100 text-yellow-700' :
                         upper === 'ROJO' ? 'bg-red-100 text-red-700' :
                         upper === 'ARCHIVADO' ? 'bg-gray-100 text-gray-600' : '';
      return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>{strVal}</span>;
    }

    return strVal;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[#1B3A5C] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#0C2340]">{title}</h2>
          <p className="text-sm text-[#1B3A5C]/60">{filteredData.length} registros encontrados</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1B3A5C]/40" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-[#1B3A5C]/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A843]/50 w-64"
            />
          </div>
          {(isAdmin || (user as any)?.appRole === 'abogado') && (
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-[#1B3A5C] hover:bg-[#0C2340] text-white"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" /> Nuevo
            </Button>
          )}
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-white rounded-xl border border-[#D4A843]/30 shadow-sm">
          <h3 className="text-sm font-bold text-[#0C2340] mb-3">Nuevo Expediente</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {columns.slice(0, 8).map(col => (
              <div key={col.key}>
                <label className="text-xs font-medium text-[#1B3A5C]/60 mb-1 block">{col.label}</label>
                <Input
                  value={newRecord[col.key] || ''}
                  onChange={e => setNewRecord({ ...newRecord, [col.key]: e.target.value })}
                  placeholder={col.label}
                  className="text-sm"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <Button onClick={handleCreate} size="sm" className="bg-[#1B3A5C] hover:bg-[#0C2340] text-white">
              <Save className="w-4 h-4 mr-1" /> Guardar
            </Button>
            <Button onClick={() => { setShowAddForm(false); setNewRecord({}); }} size="sm" variant="outline">
              <X className="w-4 h-4 mr-1" /> Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#1B3A5C]/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F0F2F5] border-b border-[#1B3A5C]/10">
                <th className="px-3 py-3 text-left text-xs font-bold text-[#1B3A5C]/70 uppercase tracking-wider w-10">#</th>
                {columns.map(col => (
                  <th key={col.key} className="px-3 py-3 text-left text-xs font-bold text-[#1B3A5C]/70 uppercase tracking-wider whitespace-nowrap" style={{ minWidth: col.width || '120px' }}>
                    {col.label}
                  </th>
                ))}
                {showSemaforo && (
                  <th className="px-3 py-3 text-left text-xs font-bold text-[#1B3A5C]/70 uppercase tracking-wider w-24">Semáforo</th>
                )}
                <th className="px-3 py-3 text-center text-xs font-bold text-[#1B3A5C]/70 uppercase tracking-wider w-24">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row: any, idx: number) => {
                const isEditing = editingId === row.id;
                const isExpanded = expandedRow === row.id;
                return (
                  <>
                    <tr
                      key={row.id}
                      className={`border-b border-[#1B3A5C]/5 transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-[#F8F9FB]'
                      } hover:bg-[#D4A843]/5`}
                    >
                      <td className="px-3 py-3 text-[#1B3A5C]/50 font-mono text-xs">{idx + 1}</td>
                      {columns.map(col => {
                        const cellColor = getCellColorClass(col.key, row[col.key], modulo);
                        return (
                          <td key={col.key} className={`px-3 py-3 ${cellColor}`}>
                            {isEditing && col.editable !== false ? (
                              <input
                                value={editData[col.key] || ''}
                                onChange={e => setEditData({ ...editData, [col.key]: e.target.value })}
                                className="w-full px-2 py-1 border border-[#D4A843]/50 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A843]"
                              />
                            ) : (
                              <span className={`text-sm ${cellColor ? 'font-semibold' : 'text-[#0C2340]'}`}>
                                {renderCellValue(row[col.key], col.key)}
                              </span>
                            )}
                          </td>
                        );
                      })}
                      {showSemaforo && (
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getSemaforoDot(row)} shadow-sm`} />
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${getSemaforoColor(row)}`}>
                              {getSemaforoLabel(row)}
                            </span>
                          </div>
                        </td>
                      )}
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {isEditing ? (
                            <>
                              <button onClick={saveEdit} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="Guardar">
                                <Save className="w-4 h-4" />
                              </button>
                              <button onClick={cancelEdit} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="Cancelar">
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEdit(row)} className="p-1.5 text-[#1B3A5C]/50 hover:text-[#D4A843] hover:bg-[#D4A843]/10 rounded-lg" title="Editar">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setExpandedRow(isExpanded ? null : row.id)}
                                className="p-1.5 text-[#1B3A5C]/50 hover:text-[#1B3A5C] hover:bg-[#1B3A5C]/10 rounded-lg"
                                title="Detalles"
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    {/* Expanded detail row */}
                    {isExpanded && (
                      <tr key={`${row.id}-detail`} className="bg-[#F0F4F8]">
                        <td colSpan={columns.length + (showSemaforo ? 3 : 2)} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                            {Object.entries(row).filter(([k]) => !['id', 'createdAt', 'updatedAt', 'abogadoUserId'].includes(k)).map(([key, value]) => (
                              <div key={key} className="flex flex-col">
                                <span className="text-xs font-medium text-[#1B3A5C]/50 uppercase">{key}</span>
                                <span className="text-[#0C2340]">
                                  {DATE_COLUMNS.has(key) ? excelSerialToDate(value) : (value != null ? String(value) : '—')}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-12 text-[#1B3A5C]/40">
            <p className="text-lg font-medium">No se encontraron registros</p>
            <p className="text-sm mt-1">Intente con otros criterios de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  );
}
