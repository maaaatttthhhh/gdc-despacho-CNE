// ============================================================
// DATA TABLE - Tabla genérica con semáforo, filtros y paginación
// Estilo: Despacho Ejecutivo - CNE
// CORREGIDO: Texto completo visible, no truncado. Tooltips expandibles.
// ============================================================
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getSemaforoColor } from '@/lib/data';
import { Search, ChevronLeft, ChevronRight, Filter, ExternalLink, Maximize2, Minimize2 } from 'lucide-react';

export interface ColumnDef {
  key: string;
  label: string;
  width?: string;
  minWidth?: string;
  isSemaforo?: boolean;
  isEtapa?: boolean;
  isLink?: boolean;
  isNumeric?: boolean;
  wrap?: boolean;
  truncate?: boolean; // backward compat - now uses compact mode toggle
}

interface DataTableProps {
  data: Record<string, string>[];
  columns: ColumnDef[];
  title: string;
  subtitle?: string;
  semaforoKey?: string;
  filterKeys?: string[];
}

function SemaforoDot({ dias }: { dias: number }) {
  const color = getSemaforoColor(dias);
  const colors = {
    green: { bg: '#22C55E', glow: 'rgba(34,197,94,0.3)', label: 'En tiempo' },
    yellow: { bg: '#EAB308', glow: 'rgba(234,179,8,0.3)', label: 'Precaución' },
    red: { bg: '#EF4444', glow: 'rgba(239,68,68,0.3)', label: 'Crítico' },
  };
  const c = colors[color];
  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: c.bg, boxShadow: `0 0 6px ${c.glow}` }}
        title={c.label}
      />
      <span className="text-sm font-mono font-medium" style={{ color: c.bg }}>{dias}</span>
    </div>
  );
}

function EtapaBadge({ value }: { value: string }) {
  if (!value || value === '' || value === '0') return <span className="text-[#1B3A5C]/30">—</span>;
  
  const isX = value.includes('X') || value.includes('x');
  const isP = value === 'P' || value === 'p';
  
  if (isX) {
    return (
      <div className="w-6 h-6 rounded bg-[#1B3A5C]/10 flex items-center justify-center">
        <span className="text-xs font-bold text-[#1B3A5C]">X</span>
      </div>
    );
  }
  if (isP) {
    return (
      <div className="w-6 h-6 rounded bg-[#D4A843]/15 flex items-center justify-center">
        <span className="text-xs font-bold text-[#D4A843]">P</span>
      </div>
    );
  }
  // If it's a number > 0, show it as a badge
  const num = parseInt(value);
  if (!isNaN(num) && num > 0) {
    return (
      <div className="px-2 py-0.5 rounded bg-[#1B3A5C]/8 text-center">
        <span className="text-xs font-semibold text-[#1B3A5C]">{num}</span>
      </div>
    );
  }
  return <span className="text-xs text-[#1B3A5C]/60">{value}</span>;
}

function LinkCell({ value }: { value: string }) {
  if (!value || value === '' || value === '—') return <span className="text-[#1B3A5C]/30">—</span>;
  
  const isUrl = value.startsWith('http') || value.startsWith('www');
  if (isUrl) {
    return (
      <a
        href={value.startsWith('http') ? value : `https://${value}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 underline"
      >
        <ExternalLink className="w-3 h-3" />
        Ver documento
      </a>
    );
  }
  return <span className="text-sm text-[#1B3A5C]/80">{value}</span>;
}

export default function DataTable({ data, columns, title, subtitle, semaforoKey }: DataTableProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filterField, setFilterField] = useState('all');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [compactMode, setCompactMode] = useState(false);

  // Filter by search
  const searchFiltered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(row =>
      Object.values(row).some(v => v && v.toString().toLowerCase().includes(q))
    );
  }, [data, search]);

  // Filter by abogado
  const filtered = useMemo(() => {
    if (filterField === 'all') return searchFiltered;
    return searchFiltered.filter(r => (r.ABOGADO || r.RESPONSABLE || r.ASESOR) === filterField);
  }, [searchFiltered, filterField]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const uniqueAbogados = useMemo(() => {
    const set = new Set(data.map(r => r.ABOGADO || r.RESPONSABLE || r.ASESOR).filter(Boolean));
    return Array.from(set).sort();
  }, [data]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#1B3A5C]/8 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#1B3A5C]/8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#0C2340]">{title}</h3>
            {subtitle && <p className="text-xs text-[#1B3A5C]/50 mt-0.5">{subtitle}</p>}
            <p className="text-xs text-[#1B3A5C]/50 mt-0.5">{filtered.length} registros encontrados</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1B3A5C]/40" />
              <Input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Buscar..."
                className="pl-9 h-9 w-56 text-sm border-[#1B3A5C]/15"
              />
            </div>
            {uniqueAbogados.length > 1 && (
              <Select value={filterField} onValueChange={v => { setFilterField(v); setPage(1); }}>
                <SelectTrigger className="h-9 w-52 text-xs border-[#1B3A5C]/15">
                  <Filter className="w-3 h-3 mr-1" />
                  <SelectValue placeholder="Filtrar abogado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los abogados</SelectItem>
                  {uniqueAbogados.map(a => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCompactMode(!compactMode)}
              className="h-9 px-3 border-[#1B3A5C]/15 text-xs"
              title={compactMode ? 'Vista expandida' : 'Vista compacta'}
            >
              {compactMode ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: `${Math.max(columns.length * 120, 1200)}px` }}>
          <thead>
            <tr className="bg-[#F8F9FA]">
              <th className="px-3 py-3 text-left text-xs font-semibold text-[#1B3A5C]/70 uppercase tracking-wider w-10 sticky left-0 bg-[#F8F9FA] z-10">#</th>
              {columns.map(col => (
                <th
                  key={col.key}
                  className="px-3 py-3 text-left text-xs font-semibold text-[#1B3A5C]/70 uppercase tracking-wider"
                  style={{ 
                    minWidth: col.minWidth || (col.isEtapa ? '50px' : col.wrap ? '180px' : '130px'),
                    width: col.width,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1B3A5C]/5">
            {paged.map((row, idx) => {
              const dias = semaforoKey ? parseInt(row[semaforoKey]) || 0 : 0;
              const sColor = semaforoKey ? getSemaforoColor(dias) : null;
              const rowBg = sColor === 'red' ? 'bg-red-50/40' : sColor === 'yellow' ? 'bg-amber-50/30' : '';
              const isExpanded = expandedRow === idx;
              
              return (
                <tr
                  key={idx}
                  className={`hover:bg-[#1B3A5C]/3 transition-colors cursor-pointer ${rowBg}`}
                  onClick={() => setExpandedRow(isExpanded ? null : idx)}
                >
                  <td className="px-3 py-2.5 text-xs text-[#1B3A5C]/40 font-mono sticky left-0 bg-inherit z-10">
                    {(page - 1) * pageSize + idx + 1}
                  </td>
                  {columns.map(col => (
                    <td key={col.key} className="px-3 py-2.5">
                      {col.isSemaforo ? (
                        <SemaforoDot dias={parseInt(row[col.key]) || 0} />
                      ) : col.isEtapa ? (
                        <EtapaBadge value={row[col.key]} />
                      ) : col.isLink ? (
                        <LinkCell value={row[col.key]} />
                      ) : col.isNumeric ? (
                        <span className="text-sm font-mono text-[#1B3A5C]/80 whitespace-nowrap">
                          {row[col.key] || '—'}
                        </span>
                      ) : (
                        <span 
                          className={`text-sm text-[#1B3A5C]/80 ${
                            compactMode 
                              ? 'block max-w-[250px] truncate' 
                              : col.wrap 
                                ? 'block' 
                                : 'whitespace-nowrap'
                          }`}
                          title={row[col.key]}
                        >
                          {row[col.key] || '—'}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
            {paged.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-5 py-12 text-center text-[#1B3A5C]/40">
                  No se encontraron registros
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-5 py-3 border-t border-[#1B3A5C]/8 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-[#1B3A5C]/50">
          <span>Mostrando {paged.length} de {filtered.length}</span>
          <Select value={String(pageSize)} onValueChange={v => { setPageSize(Number(v)); setPage(1); }}>
            <SelectTrigger className="h-7 w-20 text-xs border-[#1B3A5C]/15">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span>por página</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="h-7 w-7 p-0 border-[#1B3A5C]/15"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs text-[#1B3A5C]/60 px-2">
            {page} / {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="h-7 w-7 p-0 border-[#1B3A5C]/15"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
