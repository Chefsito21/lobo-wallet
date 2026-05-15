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

const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !passwordConfirm) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (password !== passwordConfirm) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      await signup(email, password, passwordConfirm, name);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-50 font-sans selection:bg-emerald-500/30">
      <Helmet>
        <title>Registro - LoboWallet</title>
        <meta
          name="description"
          content="Crea tu cuenta de LoboWallet para comenzar a administrar tus finanzas"
        />
      </Helmet>

      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Resplandor de fondo (Glow) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md relative z-10"
        >
          <div className="bento-card p-8 sm:p-10 shadow-2xl">
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-inner mb-6">
                <Link to="/" className="inline-flex flex-col items-center justify-center group mb-6">
                  <div className="relative flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-b from-zinc-800/50 to-zinc-900/80 border border-zinc-700/50 shadow-2xl transition-transform duration-500 group-hover:scale-105 group-hover:border-emerald-500/30">
                    
                    {/* Resplandor ambiental que se enciende al pasar el mouse */}
                    <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* El Logo a gran escala */}
                    <Logo className="w-14 h-14 relative z-10 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]" />                    
                  
                  </div>
                </Link>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 mb-2">
                Únete a la manada
              </h1>
              <p className="text-zinc-400 text-sm font-medium">
                Crea tu cuenta y toma el control de tu futuro financiero.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-2.5">
                <Label htmlFor="name" className="text-zinc-300 font-bold">
                  ¿Cómo te llamamos?
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Tu nombre o apodo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 rounded-xl h-12 px-4 font-medium placeholder:text-zinc-600 text-zinc-200 focus-visible:ring-emerald-500/50 transition-all"
                  required
                />
              </div>

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
                <Label htmlFor="password" className="text-zinc-300 font-bold">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 rounded-xl h-12 px-4 font-medium placeholder:text-zinc-600 text-zinc-200 focus-visible:ring-emerald-500/50 transition-all"
                  required
                />
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="passwordConfirm" className="text-zinc-300 font-bold">
                  Confirma tu Contraseña
                </Label>
                <Input
                  id="passwordConfirm"
                  type="password"
                  placeholder="Vuelve a escribirla"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 rounded-xl h-12 px-4 font-medium placeholder:text-zinc-600 text-zinc-200 focus-visible:ring-emerald-500/50 transition-all"
                  required
                />
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-bold mt-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-zinc-950 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                  disabled={loading}
                >
                  {loading ? 'Preparando credenciales...' : 'Registrarme ahora'}
                </Button>
              </div>
            </form>

            <div className="mt-8 text-center border-t border-zinc-800/50 pt-6">
              <p className="text-sm font-medium text-zinc-400">
                ¿Ya eres parte de la manada?{' '}
                <Link
                  to="/login"
                  className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
                >
                  Inicia sesión
                </Link>
              </p>
            </div>

          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default SignupPage;