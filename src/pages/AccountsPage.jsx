import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { Plus, CreditCard, Wallet, Banknote, Trash2, Landmark } from 'lucide-react';

const AccountsPage = () => {
  const { currentUser } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mapeo de iconos según el tipo de cuenta
  const getAccountIcon = (type) => {
    switch (type) {
      case 'debit': return <Landmark className="w-6 h-6 text-cyan-400" />;
      case 'credit': return <CreditCard className="w-6 h-6 text-purple-400" />;
      case 'cash': return <Banknote className="w-6 h-6 text-emerald-400" />;
      default: return <Wallet className="w-6 h-6 text-zinc-400" />;
    }
  };

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const records = await pb.collection('accounts').getFullList({
          filter: `userId = "${currentUser.id}"`,
          sort: '-created',
        });
        setAccounts(records);
      } catch (error) {
        console.error('Error al obtener cuentas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, [currentUser.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Skeleton className="h-10 w-64 mb-8 bg-zinc-800/50 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-40 bg-zinc-800/50 rounded-3xl" />
            <Skeleton className="h-40 bg-zinc-800/50 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-emerald-500/30">
      <Helmet>
        <title>Mis Cuentas - LoboWallet</title>
      </Helmet>

      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight text-zinc-100">
                Mis Cuentas
              </h1>
              <p className="text-zinc-400 text-lg">
                Administra tus tarjetas, efectivo y cuentas bancarias.
              </p>
            </div>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold rounded-xl px-6 py-6 flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]">
              <Plus className="w-5 h-5" />
              Nueva Cuenta
            </Button>
          </div>

          {accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 rounded-3xl border border-zinc-800/50 bg-zinc-900/20 backdrop-blur-sm">
              <div className="w-20 h-20 rounded-full bg-zinc-800/50 flex items-center justify-center mb-6">
                <Wallet className="w-10 h-10 text-zinc-500" />
              </div>
              <h3 className="text-2xl font-bold text-zinc-100 mb-2">Sin cuentas registradas</h3>
              <p className="text-zinc-400 text-center max-w-md">
                Comienza agregando tu primera cuenta bancaria, tarjeta de crédito o efectivo para tener un mejor control.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accounts.map((account, index) => (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/50 hover:bg-zinc-800/40 hover:border-zinc-700/50 transition-all group flex flex-col justify-between min-h-[160px]"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 shadow-sm group-hover:scale-105 transition-transform">
                        {getAccountIcon(account.type)}
                      </div>
                      <span className="font-bold text-zinc-100 text-lg">
                        {account.name}
                      </span>
                    </div>
                    <button className="text-zinc-600 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 p-2">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500 font-medium uppercase tracking-wider mb-1">
                      Balance Disponible
                    </p>
                    <h3
                      className="text-3xl font-bold text-zinc-100"
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      ${account.balance.toFixed(2)}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default AccountsPage;