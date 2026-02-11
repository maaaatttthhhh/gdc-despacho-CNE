import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Search, ChevronLeft, ChevronRight, Filter, ExternalLink, Plus, Pencil, Trash2, Save,
} from 'lucide-react';
import { toast } from 'sonner';

export default function Autos() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filterAsesor, setFilterAsesor] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const { data: autosList, isLoading, refetch } = trpc.autos.list.useQuery();

  const createMutation = trpc.autos.create.useMutation({
    onSuccess: () => { toast.success('Auto creado correctamente'); setDialogOpen(false); setFormData({}); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.autos.update.useMutation({
    onSuccess: () => { toast.success('Auto actualizado'); setDialogOpen(false); setEditingId(null); setFormData({}); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.autos.delete.useMutation({
    onSuccess: () => { toast.success('Auto eliminado'); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const data = autosList || [];

  const searchFiltered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row: any) =>
      Object.values(row).some(v => v && String(v).toLowerCase().includes(q))
    );
  }, [data, search]);

  const filtered = useMemo(() => {
    if (filterAsesor === 'all') return searchFiltered;
    return searchFiltered.filter((r: any) => r.asesor === filterAsesor);
  }, [searchFiltered, filterAsesor]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const uniqueAsesores = useMemo(() => {
    const set = new Set(data.map((r: any) => r.asesor).filter(Boolean));
    return Array.from(set).sort() as string[];
  }, [data]);

  const openAdd = () => {
    setEditingId(null);
    setFormData({
      numeroAuto: String(data.length + 1).padStart(3, '0'),
      fecha: new Date().toISOString().split('T')[0],
      radicado: '', asunto: '', asesor: '', enlace: '',
    });
    setDialogOpen(true);
  };

  const openEdit = (record: any) => {
    setEditingId(record.id);
    setFormData({
      numeroAuto: record.numeroAuto || '',
      fecha: record.fecha || '',
      radicado: record.radicado || '',
      asunto: record.asunto || '',
      asesor: record.asesor || '',
      enlace: record.enlace || '',
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.numeroAuto || !formData.asunto) {
      toast.error('Número de auto y asunto son obligatorios');
      return;
    }
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData });
    } else {
      createMutation.mutate({ numeroAuto: formData.numeroAuto, ...formData });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Está seguro de eliminar este registro?')) {
      deleteMutation.mutate({ id });
    }
  };

  const isAdmin = user?.role === 'admin';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[#1B3A5C] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#1B3A5C]/8 overflow-hidden">
      <div className="px-5 py-4 border-b border-[#1B3A5C]/8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#0C2340]">Autos</h3>
            <p className="text-xs text-[#1B3A5C]/50 mt-0.5">{filtered.length} registros encontrados</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1B3A5C]/40" />
              <Input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar..." className="pl-9 h-9 w-56 text-sm border-[#1B3A5C]/15" />
            </div>
            {uniqueAsesores.length > 1 && (
              <Select value={filterAsesor} onValueChange={v => { setFilterAsesor(v); setPage(1); }}>
                <SelectTrigger className="h-9 w-52 text-xs border-[#1B3A5C]/15">
                  <Filter className="w-3 h-3 mr-1" />
                  <SelectValue placeholder="Filtrar asesor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los asesores</SelectItem>
                  {uniqueAsesores.map(a => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button onClick={openAdd} size="sm" className="h-9 bg-[#1B3A5C] hover:bg-[#0C2340] text-white">
              <Plus className="w-4 h-4 mr-1" /> Nuevo Auto
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: '900px' }}>
          <thead>
            <tr className="bg-[#F8F9FA]">
              <th className="px-3 py-3 text-left text-xs font-semibold text-[#1B3A5C]/70 uppercase tracking-wider w-10">#</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-[#1B3A5C]/70 uppercase tracking-wider" style={{ minWidth: '100px' }}>Número Auto</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-[#1B3A5C]/70 uppercase tracking-wider" style={{ minWidth: '120px' }}>Fecha</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-[#1B3A5C]/70 uppercase tracking-wider" style={{ minWidth: '120px' }}>Radicado</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-[#1B3A5C]/70 uppercase tracking-wider" style={{ minWidth: '200px' }}>Asunto</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-[#1B3A5C]/70 uppercase tracking-wider" style={{ minWidth: '180px' }}>Asesor</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-[#1B3A5C]/70 uppercase tracking-wider" style={{ minWidth: '140px' }}>Enlace</th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-[#1B3A5C]/70 uppercase tracking-wider w-24">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1B3A5C]/5">
            {paged.map((row: any, idx: number) => (
              <tr key={row.id} className="hover:bg-[#1B3A5C]/3 transition-colors">
                <td className="px-3 py-2.5 text-xs text-[#1B3A5C]/40 font-mono">{(page - 1) * pageSize + idx + 1}</td>
                <td className="px-3 py-2.5 text-sm font-mono font-medium text-[#0C2340]">{row.numeroAuto}</td>
                <td className="px-3 py-2.5 text-sm text-[#1B3A5C]/80 whitespace-nowrap">{row.fecha}</td>
                <td className="px-3 py-2.5 text-sm font-mono text-[#1B3A5C]/80">{row.radicado}</td>
                <td className="px-3 py-2.5 text-sm text-[#1B3A5C]/80">{row.asunto}</td>
                <td className="px-3 py-2.5 text-sm text-[#1B3A5C]/80">{row.asesor}</td>
                <td className="px-3 py-2.5">
                  {row.enlace ? (
                    <a href={row.enlace.startsWith('http') ? row.enlace : `https://${row.enlace}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 underline">
                      <ExternalLink className="w-3 h-3" /> Ver
                    </a>
                  ) : (
                    <span className="text-[#1B3A5C]/30">—</span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(row)} className="h-7 w-7 p-0 text-[#1B3A5C]/60 hover:text-[#D4A843]">
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    {isAdmin && (
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(row.id)} className="h-7 w-7 p-0 text-[#1B3A5C]/60 hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr><td colSpan={8} className="px-5 py-12 text-center text-[#1B3A5C]/40">No se encontraron registros</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3 border-t border-[#1B3A5C]/8 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-[#1B3A5C]/50">
          <span>Mostrando {paged.length} de {filtered.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="h-7 w-7 p-0"><ChevronLeft className="w-4 h-4" /></Button>
          <span className="text-xs text-[#1B3A5C]/60 px-2">{page} / {totalPages || 1}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="h-7 w-7 p-0"><ChevronRight className="w-4 h-4" /></Button>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#0C2340]">{editingId ? 'Editar Auto' : 'Nuevo Auto'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#1B3A5C]/70 mb-1 block">Número Auto</label>
                <Input value={formData.numeroAuto || ''} onChange={e => setFormData({ ...formData, numeroAuto: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#1B3A5C]/70 mb-1 block">Fecha</label>
                <Input type="date" value={formData.fecha || ''} onChange={e => setFormData({ ...formData, fecha: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1B3A5C]/70 mb-1 block">Radicado</label>
              <Input value={formData.radicado || ''} onChange={e => setFormData({ ...formData, radicado: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1B3A5C]/70 mb-1 block">Asunto</label>
              <Input value={formData.asunto || ''} onChange={e => setFormData({ ...formData, asunto: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1B3A5C]/70 mb-1 block">Asesor</label>
              <Input value={formData.asesor || ''} onChange={e => setFormData({ ...formData, asesor: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1B3A5C]/70 mb-1 block">Enlace al documento</label>
              <Input value={formData.enlace || ''} onChange={e => setFormData({ ...formData, enlace: e.target.value })} placeholder="https://..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-[#1B3A5C] hover:bg-[#0C2340] text-white">
              <Save className="w-4 h-4 mr-1" /> Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
