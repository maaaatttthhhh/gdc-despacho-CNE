import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import {
  Bell, Mail, Send, Clock, AlertTriangle, CheckCircle2, Search, Eye, Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

const ALERT_TYPES: Record<string, { label: string; color: string; bg: string; text: string; icon: any }> = {
  critico: { label: 'Crítico', color: '#EF4444', bg: 'bg-red-50', text: 'text-red-700', icon: AlertTriangle },
  precaucion: { label: 'Precaución', color: '#EAB308', bg: 'bg-amber-50', text: 'text-amber-700', icon: Clock },
  informativo: { label: 'Informativo', color: '#3B82F6', bg: 'bg-blue-50', text: 'text-blue-700', icon: Bell },
};

const MODULES = [
  'Procesos y Prácticas', 'Inf. Logos', 'Revocatorias',
  'Inf. Ordinarios', 'Salvamentos', 'Archivados', 'Autos', 'Oficios',
];

export default function Alertas() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState('all');
  const [filterEstado, setFilterEstado] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialog, setViewDialog] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const { data: alertsList, isLoading, refetch } = trpc.alertas.list.useQuery();

  const createMutation = trpc.alertas.create.useMutation({
    onSuccess: () => { toast.success('Alerta creada y notificación enviada'); setDialogOpen(false); setFormData({}); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const updateEstadoMutation = trpc.alertas.updateEstado.useMutation({
    onSuccess: () => { toast.success('Estado actualizado'); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const alerts = alertsList || [];

  const filtered = useMemo(() => {
    let result = alerts;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((a: any) =>
        (a.abogado || '').toLowerCase().includes(q) ||
        (a.expediente || '').toLowerCase().includes(q) ||
        (a.modulo || '').toLowerCase().includes(q) ||
        (a.mensaje || '').toLowerCase().includes(q)
      );
    }
    if (filterTipo !== 'all') result = result.filter((a: any) => a.tipo === filterTipo);
    if (filterEstado !== 'all') result = result.filter((a: any) => a.estado === filterEstado);
    return result;
  }, [alerts, search, filterTipo, filterEstado]);

  const stats = useMemo(() => ({
    total: alerts.length,
    pendientes: alerts.filter((a: any) => a.estado === 'pendiente').length,
    enviadas: alerts.filter((a: any) => a.estado === 'enviada').length,
    criticas: alerts.filter((a: any) => a.tipo === 'critico').length,
  }), [alerts]);

  const openNewAlert = () => {
    setFormData({ tipo: 'informativo', abogado: '', email: '', modulo: '', expediente: '', mensaje: '' });
    setDialogOpen(true);
  };

  const handleSendAlert = () => {
    if (!formData.abogado || !formData.mensaje || !formData.modulo) {
      toast.error('Abogado, módulo y mensaje son obligatorios');
      return;
    }
    createMutation.mutate({
      tipo: formData.tipo as any || 'informativo',
      destinatarioNombre: formData.abogado,
      destinatarioEmail: formData.email || '',
      modulo: formData.modulo,
      expedienteRef: formData.expediente || '',
      mensaje: formData.mensaje,
    });
  };

  const handleMarkSent = (alert: any) => {
    updateEstadoMutation.mutate({ id: alert.id, estado: 'enviada' });
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
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Alertas', value: stats.total, icon: Bell, color: '#1B3A5C' },
          { label: 'Pendientes', value: stats.pendientes, icon: Clock, color: '#EAB308' },
          { label: 'Enviadas', value: stats.enviadas, icon: Send, color: '#22C55E' },
          { label: 'Críticas', value: stats.criticas, icon: AlertTriangle, color: '#EF4444' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-white rounded-xl shadow-sm border border-[#1B3A5C]/8 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}10` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0C2340]">{stat.value}</p>
                <p className="text-xs text-[#1B3A5C]/50">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-sm border border-[#1B3A5C]/8 overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1B3A5C]/8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#0C2340] flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#D4A843]" /> Centro de Alertas
              </h3>
              <p className="text-xs text-[#1B3A5C]/50 mt-0.5">Gestión de alertas y notificaciones</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1B3A5C]/40" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="pl-9 h-9 w-48 text-sm border-[#1B3A5C]/15" />
              </div>
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger className="h-9 w-36 text-xs border-[#1B3A5C]/15"><SelectValue placeholder="Tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="critico">Crítico</SelectItem>
                  <SelectItem value="precaucion">Precaución</SelectItem>
                  <SelectItem value="informativo">Informativo</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger className="h-9 w-36 text-xs border-[#1B3A5C]/15"><SelectValue placeholder="Estado" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="enviada">Enviada</SelectItem>
                  <SelectItem value="leida">Leída</SelectItem>
                </SelectContent>
              </Select>
              {isAdmin && (
                <Button onClick={openNewAlert} size="sm" className="h-9 bg-[#1B3A5C] hover:bg-[#0C2340] text-white">
                  <Bell className="w-4 h-4 mr-1" /> Nueva Alerta
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="divide-y divide-[#1B3A5C]/5">
          {filtered.map((alert: any) => {
            const typeInfo = ALERT_TYPES[alert.tipo] || ALERT_TYPES.informativo;
            const TypeIcon = typeInfo.icon;
            return (
              <div key={alert.id} className={`px-5 py-4 hover:bg-[#1B3A5C]/2 transition-colors ${alert.estado === 'pendiente' ? 'bg-amber-50/20' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${typeInfo.bg}`}>
                    <TypeIcon className={`w-5 h-5 ${typeInfo.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${typeInfo.bg} ${typeInfo.text}`}>
                        {typeInfo.label}
                      </span>
                      <span className="text-xs text-[#1B3A5C]/40">{alert.modulo}</span>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        alert.estado === 'pendiente' ? 'bg-amber-100 text-amber-700' :
                        alert.estado === 'enviada' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {alert.estado}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-[#0C2340]">{alert.abogado}</p>
                    <p className="text-xs text-[#1B3A5C]/60 mt-0.5">{alert.mensaje}</p>
                    <p className="text-xs text-[#1B3A5C]/30 mt-1">{alert.fecha} &middot; {alert.expediente}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => setViewDialog(alert)} className="h-7 w-7 p-0 text-[#1B3A5C]/50 hover:text-[#1B3A5C]">
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    {alert.estado === 'pendiente' && isAdmin && (
                      <Button variant="ghost" size="sm" onClick={() => handleMarkSent(alert)} className="h-7 w-7 p-0 text-green-600/50 hover:text-green-600">
                        <Send className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="px-5 py-12 text-center text-[#1B3A5C]/40">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No se encontraron alertas</p>
            </div>
          )}
        </div>
      </div>

      {/* New Alert Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#0C2340]">Nueva Alerta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#1B3A5C]/70 mb-1 block">Tipo</label>
                <Select value={formData.tipo || 'informativo'} onValueChange={v => setFormData({ ...formData, tipo: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critico">Crítico</SelectItem>
                    <SelectItem value="precaucion">Precaución</SelectItem>
                    <SelectItem value="informativo">Informativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#1B3A5C]/70 mb-1 block">Módulo</label>
                <Select value={formData.modulo || ''} onValueChange={v => setFormData({ ...formData, modulo: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {MODULES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1B3A5C]/70 mb-1 block">Abogado</label>
              <Input value={formData.abogado || ''} onChange={e => setFormData({ ...formData, abogado: e.target.value })} placeholder="Nombre del abogado" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1B3A5C]/70 mb-1 block">Email</label>
              <Input value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="correo@cne.gov.co" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1B3A5C]/70 mb-1 block">Expediente</label>
              <Input value={formData.expediente || ''} onChange={e => setFormData({ ...formData, expediente: e.target.value })} placeholder="RAD-XXXXX" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1B3A5C]/70 mb-1 block">Mensaje</label>
              <Textarea value={formData.mensaje || ''} onChange={e => setFormData({ ...formData, mensaje: e.target.value })} rows={3} placeholder="Descripción de la alerta..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSendAlert} className="bg-[#1B3A5C] hover:bg-[#0C2340] text-white">
              <Send className="w-4 h-4 mr-1" /> Enviar Alerta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Alert Dialog */}
      <Dialog open={!!viewDialog} onOpenChange={() => setViewDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#0C2340]">Detalle de Alerta</DialogTitle>
          </DialogHeader>
          {viewDialog && (
            <div className="space-y-3 py-2 text-sm">
              <div className="flex items-center gap-2">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${(ALERT_TYPES[viewDialog.tipo] || ALERT_TYPES.informativo).bg} ${(ALERT_TYPES[viewDialog.tipo] || ALERT_TYPES.informativo).text}`}>
                  {(ALERT_TYPES[viewDialog.tipo] || ALERT_TYPES.informativo).label}
                </span>
                <span className="text-[#1B3A5C]/40">{viewDialog.fecha}</span>
              </div>
              <div><strong>Abogado:</strong> {viewDialog.abogado}</div>
              <div><strong>Email:</strong> {viewDialog.email || '—'}</div>
              <div><strong>Módulo:</strong> {viewDialog.modulo}</div>
              <div><strong>Expediente:</strong> {viewDialog.expediente || '—'}</div>
              <div><strong>Mensaje:</strong> {viewDialog.mensaje}</div>
              <div><strong>Estado:</strong> {viewDialog.estado}</div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialog(null)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
