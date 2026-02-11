// ============================================================
// LOGIN PAGE - Software de Gestión Documental
// Estilo: Despacho Ejecutivo - Fondo institucional con card elegante
// ============================================================
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, User, Eye, EyeOff, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const LOGIN_BG = 'https://private-us-east-1.manuscdn.com/sessionFile/aEm6uIeWz7Le0iK77Kad95/sandbox/S2SRKR9KZj18zySGyPnjCM-img-1_1770700591000_na1fn_bG9naW4tYmc.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvYUVtNnVJZVd6N0xlMGlLNzdLYWQ5NS9zYW5kYm94L1MyU1JLUjlLWmoxOHp5U0d5UG5qQ00taW1nLTFfMTc3MDcwMDU5MTAwMF9uYTFmbl9iRzluYVc0dFltYy5qcGc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=pGjGJEuHCxtfGhkRBF3GpjZ0Ya8lyqOw-mhLcXnRlCoGHGpiW5OBn-4sL4qFbCYSg4r3U07mFKXJr1INlo1tip6-OF91GtbX8ojyLYGCpFC4b53ldY99wjLye~kvv66x0lOl5lPhVBXCiiOX6qXciNBKkeT4a~Xugqbr8hUiAAUSH0Q7COaBvcjXQC7hJ5sUzpm~Guq5BhU4dgxVv0IqCzJZ95WS9D~jQFAq3LVLJ6bqDQK-hfWkff7rM6OLvsni23z-ZKnPVD2ttGZVLVzjtlsYXHnX9Ij9vTYPZ84J6cjRakibM5yIF-mEnvLbi9nyI6uTOtw96cqadpXVeZYIdA__';

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Simulate brief loading
    await new Promise(r => setTimeout(r, 800));
    
    const success = login(username, password);
    if (!success) {
      setError('Credenciales incorrectas. Intente nuevamente.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${LOGIN_BG})` }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0C2340]/85 via-[#1B3A5C]/80 to-[#0C2340]/90" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1B3A5C] via-[#D4A843] to-[#C8102E]" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#C8102E] via-[#D4A843] to-[#1B3A5C]" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-lg shadow-2xl overflow-hidden">
          {/* Header with tricolor stripe */}
          <div className="h-1.5 bg-gradient-to-r from-[#1B3A5C] via-[#D4A843] to-[#C8102E]" />
          
          <div className="px-8 pt-8 pb-6">
            {/* Logo / Icon */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 rounded-full bg-[#1B3A5C] flex items-center justify-center mb-4 shadow-lg">
                <FileText className="w-8 h-8 text-[#D4A843]" />
              </div>
              <h1 className="text-xl font-bold text-[#0C2340] text-center tracking-tight leading-tight">
                SOFTWARE DE GESTIÓN<br />DOCUMENTAL
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="h-px w-8 bg-[#D4A843]" />
                <span className="text-xs font-medium text-[#1B3A5C]/60 uppercase tracking-widest">
                  CNE Colombia
                </span>
                <div className="h-px w-8 bg-[#D4A843]" />
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-[#1B3A5C]">
                  Usuario
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1B3A5C]/40" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Ingrese su usuario"
                    className="pl-10 h-11 border-[#1B3A5C]/20 focus:border-[#1B3A5C] focus:ring-[#1B3A5C]/20 bg-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-[#1B3A5C]">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1B3A5C]/40" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Ingrese su contraseña"
                    className="pl-10 pr-10 h-11 border-[#1B3A5C]/20 focus:border-[#1B3A5C] focus:ring-[#1B3A5C]/20 bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1B3A5C]/40 hover:text-[#1B3A5C]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2"
                >
                  {error}
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#1B3A5C] hover:bg-[#0C2340] text-white font-semibold shadow-lg transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verificando...
                  </div>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </form>
          </div>

          {/* Users hint */}
          <div className="px-8 py-3 bg-[#1B3A5C]/3 border-t border-[#1B3A5C]/8">
            <details className="text-xs text-[#1B3A5C]/50">
              <summary className="cursor-pointer hover:text-[#1B3A5C]/70 font-medium">Usuarios del sistema</summary>
              <div className="mt-2 space-y-1 text-[10px] text-[#1B3A5C]/40">
                <p><span className="font-semibold">admin</span> — Magistrado (Benjamín Ortiz Torres)</p>
                <p><span className="font-semibold">kpalacio</span> — Karen Ines Palacio Ferrer</p>
                <p><span className="font-semibold">lyepes</span> — Leidy Tatiana Yepes Joya</p>
                <p><span className="font-semibold">abastidas</span> — Angelica J. Bastidas Salgado</p>
                <p><span className="font-semibold">dvergara</span> — Diana M. Vergara Llanos</p>
                <p><span className="font-semibold">jlopez</span> — Julian David López Lovera</p>
                <p className="mt-1 italic">Contraseña para todos: CNE2025*</p>
              </div>
            </details>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-[#F8F9FA] border-t border-[#1B3A5C]/10">
            <p className="text-xs text-center text-[#1B3A5C]/50">
              Despacho del Magistrado Benjamín Ortiz Torres
            </p>
            <p className="text-xs text-center text-[#1B3A5C]/40 mt-1">
              Consejo Nacional Electoral &middot; 2025
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
