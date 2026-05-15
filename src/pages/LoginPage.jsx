import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Logo from '@/components/Logo.jsx';

import { useAuth } from '@/contexts/AuthContext.jsx';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Wallet, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

import Header from '@/components/Header.jsx';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Correo o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-50 font-sans selection:bg-emerald-500/30">
      <Helmet>
        <title>Iniciar Sesión - LoboWallet</title>
        <meta
          name="description"
          content="Inicia sesión en tu cuenta de LoboWallet para administrar tus finanzas"
        />
      </Helmet>

      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Resplandor de fondo (Glow) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md h-[400px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md relative z-10"
        >
          <div className="bento-card p-8 sm:p-10 shadow-2xl">
            
            <div className="text-center mb-8">
              <Link to="/" className="inline-flex flex-col items-center justify-center group mb-6">
                <div className="relative flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-b from-zinc-800/50 to-zinc-900/80 border border-zinc-700/50 shadow-2xl transition-transform duration-500 group-hover:scale-105 group-hover:border-emerald-500/30">
                  
                  {/* Resplandor ambiental que se enciende al pasar el mouse */}
                  <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* El Logo a gran escala */}
                  <Logo className="w-14 h-14 relative z-10 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]" />                    
                
                </div>
              </Link>
              
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 mb-2">
                Bienvenido de nuevo
              </h1>
              <p className="text-zinc-400 text-sm font-medium">
                Accede a tu panel de comando financiero.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-2.5">
                <Label htmlFor="email" className="text-zinc-300 font-bold">
                  Correo Electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="lobo@universidad.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 rounded-xl h-12 px-4 font-medium placeholder:text-zinc-600 text-zinc-200 focus-visible:ring-emerald-500/50 transition-all"
                  required
                />
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-zinc-300 font-bold">
                    Contraseña
                  </Label>
                  <Link to="#" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 rounded-xl h-12 px-4 font-medium placeholder:text-zinc-600 text-zinc-200 focus-visible:ring-emerald-500/50 transition-all"
                  required
                />
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-bold"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-zinc-950 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                  disabled={loading}
                >
                  {loading ? 'Verificando credenciales...' : 'Iniciar Sesión'}
                </Button>
              </div>
            </form>

            <div className="mt-8 text-center border-t border-zinc-800/50 pt-6">
              <p className="text-sm font-medium text-zinc-400">
                ¿Aún no eres parte de la manada?{' '}
                <Link
                  to="/signup"
                  className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
                >
                  Regístrate
                </Link>
              </p>
            </div>

          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default LoginPage;