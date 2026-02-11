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

export default function Oficios() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filterResponsable, setFilterResponsable] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const { data: oficiosList, isLoading, refetch } = trpc.oficios.list.useQuery();

  const createMutation = trpc.oficios.create.useMutation({
    onSuccess: () => { toast.success('Oficio creado correctamente'); setDialogOpen(false); setFormData({}); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.oficios.update.useMutation({
    onSuccess: () => { toast.success('Oficio actualizado'); setDialogOpen(false); setEditingId(null); setFormData({}); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.oficios.delete.useMutation({
    onSuccess: () => { toast.success('Oficio eliminado'); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const data = oficiosList || [];

  const searchFiltered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row: any) =>
      Object.values(row).some(v => v && String(v).toLowerCase().includes(q))
    );
  }, [data, search]);

  const filtered = useMemo(() => {
    if (filterResponsable === 'all') return searchFiltered;
    return searchFiltered.filter((r: any) => r.responsable === filterResponsable);
  }, [searchFiltered, filterResponsable]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const uniqueResponsables = useMemo(() => {
    const set = new Set(data.map((r: any) => r.responsable).filter(Boolean));
    return Array.from(set).sort() as string[];
  }, [data]);

  const openAdd = () => {
    setEditingId(null);
    setFormData({
      noOficio: `OF-${String(data.length + 1).padStart(3, '0')}`,
      fecha: new Date().toISOString().split('T')[0],
      radicado: '', destinatario: '', asunto: '', responsable: '', estado: 'Pendiente', enlace: '',
    });
    setDialogOpen(true);
  };

  const openEdit = (record: any) => {
    setEditingId(record.id);
    setFormData({
      noOficio: record.noOficio || '',
      fecha: record.fecha || '',
      radicado: record.radicado || '',
      destinatario: record.destinatario || '',
      asunto: record.asunto || '',
      responsable: record.responsable || '',
      estado: record.estado || '',
      enlace: record.enlace || '',
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.noOficio || !formData.asunto) {
      toast.error('Número de oficio y asunto son obligatorios');
      return;
    }
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData });
    } else {
      createMutation.mutate({ noOficio: formData.noOficio, ...formData });
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
            <h3 className="text-base font-bold text-[#0C2340]">Oficios</h3>
            <p className="text-xs text-[#1B3A5C]/50 mt-0.5">{filtered.length} registros encontrados</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1B3A5C]/40" />
              <Input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar..." className="pl-9 h-9 w-56 text-sm border-[#1B3A5C]/15" />
            </div>
            {uniqueResponsables.length > 1 && (
              <Select value={filterResponsable} onValueChange={v => { setFilterResponsable(v); setPage(1); }}>
                <SelectTrigger className="h-9 w-52 text-xs border-[#1B3A5C]/15">
                  <Filter className="w-3 h-3 mr-1" />
                  <SelectValue placeholder="Filtrar responsable" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los responsables</SelectItem>
                  {uniqueResponsables.map(a => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button onClick={openAdd} size="sm" className="h-9 bg-[#1B3A5C] hover:bg-[#0C2340] text-white">
              <Plus className="w-4 h-4 mr-1" /> Nuevo Oficio
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: '1100px' }}>
          <thead>
            <tr className="bg-[#F8F9FA]">
              <th className="px-3 py-3 text-left text-xs font-semibold text-[#1B3A5C]/70 uppercase tracking-wider w-10">#</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-[#1B3A5C]/70 uppercase tracking-wider" style={{ minWidth: '110px' }}>No. Oficio</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-[#1B3A5C]/70 uppercase tracking-wider" style={{ minWidth: '110px' }}>Fecha</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-[#1B3A5C]/70 uppercase tracking-wider" style={{ minWidth: '100px' }}>Radicado</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-[#1B3A5C]/70 uppercase tracking-wider" style={{ minWidth: '180px' }}>Destinatario</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-[#1B3A5C]/70 uppercase tracking-wider" style={{ minWidth: '220px' }}>Asunto</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-[#1B3A5C]/70 uppercase tracking-wider" style={{ minWidth: '180px' }}>Responsable</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-[#1B3A5C]/70 uppercase tracking-wider" style={{ minWidth: '100px' }}>Estado</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-[#1B3A5C]/70 uppercase tracking-wider" style={{ minWidth: '100px' }}>Enlace</th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-[#1B3A5C]/70 uppercase tracking-wider w-24">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1B3A5C]/5">
            {paged.map((row: any, idx: number) => (
              <tr key={row.id} className="hover:bg-[#1B3A5C]/3 transition-colors">
                <td className="px-3 py-2.5 text-xs text-[#1B3A5C]/40 font-mono">{(page - 1) * pageSize + idx + 1}</td>
                <td className="px-3 py-2.5 text-sm font-mono font-medium text-[#0C2340]">{row.noOficio}</td>
                <td className="px-3 py-2.5 text-sm text-[#1B3A5C]/80 whitespace-nowrap">{row.fecha}</td>
                <td className="px-3 py-2.5 text-sm font-mono text-[#1B3A5C]/80">{row.radicado}</td>
                <td className="px-3 py-2.5 text-sm text-[#1B3A5C]/80">{row.destinatario}</td>
                <td className="px-3 py-2.5 text-sm text-[#1B3A5C]/80">{row.asunto}</td>
                <td className="px-3 py-2.5 text-sm text-[#1B3A5C]/80">{row.responsable}</td>
                <td className="px-3 py-2.5">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                    row.estado === 'Enviado' ? 'bg-green-100 text-green-700' :
                    row.estado === 'Pendiente' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {row.estado || '—'}
                  </span>
                </td>
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
              <tr><td colSpan={10} className="px-5 py-12 text-center text-[#1B3A5C]/40">No se encontraron registros</td></tr>
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
            <DialogTitle className="text-[#0C2340]">{editingId ? 'Editar Oficio' : 'Nuevo Oficio'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#1B3A5C]/70 mb-1 block">No. Oficio</label>
                <Input value={formData.noOficio || ''} onChange={e => setFormData({ ...formData, noOficio: e.target.value })} />
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
              <label className="text-xs font-semibold text-[#1B3A5C]/70 mb-1 block">Destinatario</label>
              <Input value={formData.destinatario || ''} onChange={e => setFormData({ ...formData, destinatario: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1B3A5C]/70 mb-1 block">Asunto</label>
              <Input value={formData.asunto || ''} onChange={e => setFormData({ ...formData, asunto: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1B3A5C]/70 mb-1 block">Responsable</label>
              <Input value={formData.responsable || ''} onChange={e => setFormData({ ...formData, responsable: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1B3A5C]/70 mb-1 block">Estado</label>
              <Select value={formData.estado || 'Pendiente'} onValueChange={v => setFormData({ ...formData, estado: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="Enviado">Enviado</SelectItem>
                  <SelectItem value="Recibido">Recibido</SelectItem>
                </SelectContent>
              </Select>
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
