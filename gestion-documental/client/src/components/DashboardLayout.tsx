// ============================================================
// DASHBOARD LAYOUT - Sidebar oscuro + Header con perfil
// Estilo: Despacho Ejecutivo - CNE
// ACTUALIZADO: Full-stack con OAuth real
// ============================================================
import { useState, type ReactNode } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation, Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Image,
  RotateCcw,
  ClipboardList,
  BookOpen,
  Archive,
  LogOut,
  Menu,
  ChevronRight,
  User,
  Gavel,
  Mail as MailIcon,
  Bell,
  Users,
  Settings,
  Upload,
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  count?: number;
  section?: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Dashboard', shortLabel: 'Dashboard', icon: LayoutDashboard, section: 'Principal' },
  { path: '/procesos-practicas', label: 'Procesos y Prácticas', shortLabel: 'Procesos', icon: FileText, section: 'Módulos' },
  { path: '/inf-logos', label: 'Inf. Logos', shortLabel: 'Logos', icon: Image, section: 'Módulos' },
  { path: '/revocatorias', label: 'Revocatorias', shortLabel: 'Revoc.', icon: RotateCcw, section: 'Módulos' },
  { path: '/inf-ordinarios', label: 'Inf. Ordinarios', shortLabel: 'Ordinarios', icon: ClipboardList, section: 'Módulos' },
  { path: '/salvamentos', label: 'Salvamentos y Aclaraciones', shortLabel: 'Salvamentos', icon: BookOpen, section: 'Módulos' },
  { path: '/archivados', label: 'Archivados', shortLabel: 'Archivados', icon: Archive, section: 'Módulos' },
  { path: '/autos', label: 'Autos', shortLabel: 'Autos', icon: Gavel, section: 'Documentos' },
  { path: '/oficios', label: 'Oficios', shortLabel: 'Oficios', icon: MailIcon, section: 'Documentos' },
  { path: '/alertas', label: 'Alertas', shortLabel: 'Alertas', icon: Bell, section: 'Gestión' },
  { path: '/admin-usuarios', label: 'Gestión de Usuarios', shortLabel: 'Usuarios', icon: Users, section: 'Administración', adminOnly: true },
  { path: '/config-semaforo', label: 'Configuración Semáforo', shortLabel: 'Semáforo', icon: Settings, section: 'Administración', adminOnly: true },
  { path: '/importar-excel', label: 'Importar Excel', shortLabel: 'Importar', icon: Upload, section: 'Administración', adminOnly: true },
];

const roleLabels: Record<string, string> = {
  magistrado: 'Magistrado',
  administrador: 'Administrador',
  abogado: 'Abogado',
  admin: 'Administrador',
  user: 'Usuario',
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const currentPage = navItems.find(item => item.path === location);
  const isAdmin = user?.role === 'admin' || (user as any)?.appRole === 'magistrado' || (user as any)?.appRole === 'administrador';
  const appRole = (user as any)?.appRole || 'abogado';

  // Filter nav items based on role
  const filteredNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

  // Group items by section
  const sections = filteredNavItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    const section = item.section || 'Otros';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen flex bg-[#F5F6F8]">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen z-50 lg:z-auto
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${collapsed ? 'w-[72px]' : 'w-[260px]'}
          bg-[#0F2440] text-white flex flex-col
        `}
      >
        {/* Sidebar Header */}
        <div className={`px-4 pt-5 pb-4 border-b border-white/10 ${collapsed ? 'items-center' : ''}`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="w-10 h-10 rounded-lg bg-[#D4A843]/20 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-[#D4A843]" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <h2 className="text-sm font-bold text-white leading-tight">GESTIÓN</h2>
                <h2 className="text-sm font-bold text-[#D4A843] leading-tight">DOCUMENTAL</h2>
              </div>
            )}
          </div>
          {/* Tricolor line */}
          <div className={`mt-4 flex h-0.5 rounded-full overflow-hidden ${collapsed ? 'mx-0' : ''}`}>
            <div className="flex-1 bg-[#1B3A5C]" />
            <div className="flex-1 bg-[#D4A843]" />
            <div className="flex-1 bg-[#C8102E]" />
          </div>
        </div>

        {/* Profile Section */}
        {!collapsed && (
          <div className="px-4 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#1B3A5C] border-2 border-[#D4A843]/40 flex items-center justify-center overflow-hidden flex-shrink-0">
                <User className="w-5 h-5 text-[#D4A843]/70" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">{user?.name || 'Usuario'}</p>
                <p className="text-xs text-[#D4A843]/70">{roleLabels[appRole] || 'Usuario'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto">
          {Object.entries(sections).map(([sectionName, items]) => (
            <div key={sectionName} className="mb-2">
              {!collapsed && (
                <p className="px-3 py-1.5 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  {sectionName}
                </p>
              )}
              <div className="space-y-0.5">
                {items.map(item => {
                  const isActive = location === item.path;
                  const Icon = item.icon;
                  return (
                    <Link key={item.path} href={item.path}>
                      <div
                        onClick={() => setSidebarOpen(false)}
                        className={`
                          group flex items-center gap-3 rounded-lg transition-all duration-200
                          ${collapsed ? 'justify-center px-2 py-3' : 'px-3 py-2'}
                          ${isActive 
                            ? 'bg-[#D4A843]/15 text-[#D4A843] shadow-sm' 
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                          }
                        `}
                        title={collapsed ? item.label : undefined}
                      >
                        <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-[#D4A843]' : ''}`} />
                        {!collapsed && (
                          <span className="text-sm font-medium truncate flex-1">{item.label}</span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="px-2 py-3 border-t border-white/10">
          <button
            onClick={logout}
            className={`
              flex items-center gap-3 w-full rounded-lg px-3 py-2.5
              text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <LogOut className="w-[18px] h-[18px]" />
            {!collapsed && <span className="text-sm font-medium">Cerrar Sesión</span>}
          </button>
          
          {/* Collapse toggle - desktop only */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-full mt-2 py-2 text-white/30 hover:text-white/60 transition-colors"
          >
            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-[#1B3A5C]/10 shadow-sm">
          <div className="flex items-center justify-between px-4 lg:px-6 h-14">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 text-[#1B3A5C] hover:bg-[#1B3A5C]/5 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-base font-bold text-[#0C2340]">
                  {currentPage?.label || 'Dashboard'}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm text-[#1B3A5C]/60">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Sistema activo
              </div>
              <div className="h-8 w-px bg-[#1B3A5C]/10 hidden sm:block" />
              <div className="hidden sm:block text-right">
                <p className="text-xs font-semibold text-[#0C2340]">{user?.name || 'Usuario'}</p>
                <p className="text-xs text-[#1B3A5C]/50">{roleLabels[appRole] || 'CNE'}</p>
              </div>
            </div>
          </div>
          {/* Tricolor accent line */}
          <div className="flex h-[2px]">
            <div className="flex-1 bg-[#1B3A5C]" />
            <div className="flex-1 bg-[#D4A843]" />
            <div className="flex-1 bg-[#C8102E]" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
