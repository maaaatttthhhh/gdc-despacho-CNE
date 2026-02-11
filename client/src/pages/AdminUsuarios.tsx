// ============================================================
// ADMIN USUARIOS - Panel de gestión de usuarios
// Solo visible para administradores y magistrado
// ============================================================
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { Users, Shield, UserCheck, UserX, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const roleLabels: Record<string, { label: string; color: string; bg: string }> = {
  magistrado: { label: 'Magistrado', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  administrador: { label: 'Administrador', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  abogado: { label: 'Abogado', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
};

export default function AdminUsuarios() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: usuarios, isLoading, refetch } = trpc.users.list.useQuery();

  const updateRoleMutation = trpc.users.updateRole.useMutation({
    onSuccess: () => {
      toast.success('Rol actualizado correctamente');
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || 'Error al actualizar rol');
    },
  });

  const toggleActiveMutation = trpc.users.toggleActive.useMutation({
    onSuccess: () => {
      toast.success('Estado actualizado correctamente');
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || 'Error al actualizar estado');
    },
  });

  const filteredUsers = (usuarios || []).filter((u: any) => {
    if (!searchTerm) return true;
    const lower = searchTerm.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(lower)) ||
      (u.email && u.email.toLowerCase().includes(lower)) ||
      (u.appRole && u.appRole.toLowerCase().includes(lower))
    );
  });

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
          <h2 className="text-xl font-bold text-[#0C2340] flex items-center gap-2">
            <Users className="w-6 h-6 text-[#D4A843]" />
            Gestión de Usuarios
          </h2>
          <p className="text-sm text-[#1B3A5C]/60 mt-1">
            {filteredUsers.length} usuarios registrados en el sistema
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1B3A5C]/40" />
          <input
            type="text"
            placeholder="Buscar usuario..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-[#1B3A5C]/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A843]/50 w-64"
          />
        </div>
      </div>

      {/* Info box */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> Los usuarios se registran automáticamente cuando inician sesión por primera vez.
          Desde aquí puede asignar roles y activar/desactivar cuentas. Los abogados solo pueden ver y editar sus propios expedientes.
        </p>
      </div>

      {/* Roles legend */}
      <div className="flex flex-wrap gap-3 mb-6">
        {Object.entries(roleLabels).map(([key, { label, color, bg }]) => (
          <div key={key} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${bg} ${color}`}>
            <Shield className="w-3 h-3" />
            {label}
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#1B3A5C]/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F0F2F5] border-b border-[#1B3A5C]/10">
                <th className="px-4 py-3 text-left text-xs font-bold text-[#1B3A5C]/70 uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#1B3A5C]/70 uppercase tracking-wider">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#1B3A5C]/70 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#1B3A5C]/70 uppercase tracking-wider">Rol del Sistema</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#1B3A5C]/70 uppercase tracking-wider">Rol en App</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#1B3A5C]/70 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#1B3A5C]/70 uppercase tracking-wider">Último Acceso</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-[#1B3A5C]/70 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u: any, idx: number) => {
                const roleInfo = roleLabels[u.appRole] || { label: u.appRole || 'Sin rol', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200' };
                const isCurrentUser = u.openId === (user as any)?.openId;
                return (
                  <tr
                    key={u.id}
                    className={`border-b border-[#1B3A5C]/5 transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-[#F8F9FB]'
                    } hover:bg-[#D4A843]/5 ${isCurrentUser ? 'ring-1 ring-inset ring-[#D4A843]/30' : ''}`}
                  >
                    <td className="px-4 py-3 text-[#1B3A5C]/50 font-mono text-xs">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#1B3A5C] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {(u.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-[#0C2340] text-sm">{u.name || 'Sin nombre'}</p>
                          {isCurrentUser && <span className="text-[10px] text-[#D4A843] font-medium">(Tú)</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#1B3A5C]/70 text-sm">{u.email || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                        {u.role === 'admin' ? 'Admin' : 'Usuario'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.appRole || 'abogado'}
                        onChange={e => {
                          if (isCurrentUser) {
                            toast.error('No puede cambiar su propio rol');
                            return;
                          }
                          updateRoleMutation.mutate({
                            userId: u.id,
                            appRole: e.target.value as any,
                          });
                        }}
                        disabled={isCurrentUser}
                        className={`text-xs px-2 py-1 rounded-lg border font-medium ${roleInfo.bg} ${roleInfo.color} ${isCurrentUser ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <option value="magistrado">Magistrado</option>
                        <option value="administrador">Administrador</option>
                        <option value="abogado">Abogado</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {u.isActive !== false ? (
                        <span className="flex items-center gap-1 text-xs text-green-700">
                          <UserCheck className="w-3.5 h-3.5" /> Activo
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-red-600">
                          <UserX className="w-3.5 h-3.5" /> Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#1B3A5C]/50">
                      {u.lastSignedIn ? new Date(u.lastSignedIn).toLocaleDateString('es-CO', {
                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      }) : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {!isCurrentUser && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            toggleActiveMutation.mutate({
                              userId: u.id,
                              isActive: u.isActive === false ? true : false,
                            });
                          }}
                          className={`text-xs ${u.isActive !== false ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                        >
                          {u.isActive !== false ? 'Desactivar' : 'Activar'}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-[#1B3A5C]/40">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No se encontraron usuarios</p>
            <p className="text-sm mt-1">Los usuarios se registran al iniciar sesión por primera vez</p>
          </div>
        )}
      </div>
    </div>
  );
}
