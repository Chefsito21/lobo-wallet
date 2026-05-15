import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  PieChart,
  Target,
  DollarSign,
  Tag,
  CreditCard
} from 'lucide-react';
import Header from '@/components/Header.jsx';
import { motion } from 'framer-motion';
import { FLAT_ICONS } from '@/lib/iconData.js';

const DashboardPage = () => {
  const { currentUser } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Consultamos tanto las transacciones como las cuentas en paralelo
        const [txRecords, accountsRecords] = await Promise.all([
          pb.collection('transactions').getFullList({
            filter: `userId = "${currentUser.id}"`,
            sort: '-date,-created',
            $autoCancel: false,
            expand: 'category',
          }),
          pb.collection('accounts').getFullList({
            filter: `userId = "${currentUser.id}"`,
            sort: '-created',
            $autoCancel: false,
          })
        ]);

        setTransactions(txRecords);
        setAccounts(accountsRecords);

        const income = txRecords
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);

        const expenses = txRecords
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        setStats({
          totalIncome: income,
          totalExpenses: expenses,
          balance: income - expenses,
        });

      } catch (error) {
        console.error('Error al obtener datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser.id]);

  const recentTransactions = transactions.slice(0, 8);

  const quickActions = [
    {
      title: 'Agregar Transacción',
      path: '/transactions',
      icon: Receipt,
      color: 'text-primary bg-primary/10',
      hoverBorder: 'hover:border-primary/50'
    },
    {
      title: 'Resumen Mensual',
      path: '/monthly-summary',
      icon: PieChart,
      color: 'text-emerald-400 bg-emerald-500/10',
      hoverBorder: 'hover:border-emerald-500/50'
    },
    {
      title: 'Administrar Presupuestos',
      path: '/budgets',
      icon: DollarSign,
      color: 'text-cyan-400 bg-cyan-500/10',
      hoverBorder: 'hover:border-cyan-500/50'
    },
    {
      title: 'Metas de Ahorro',
      path: '/savings-goals',
      icon: Target,
      color: 'text-purple-400 bg-purple-500/10',
      hoverBorder: 'hover:border-purple-500/50'
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50">
        <Helmet>
          <title>Panel Principal - LoboWallet</title>
        </Helmet>
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
          <Skeleton className="h-10 w-64 mb-2 bg-zinc-800/50 rounded-lg" />
          <Skeleton className="h-6 w-48 mb-8 bg-zinc-800/50 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Skeleton className="h-48 md:col-span-2 bg-zinc-800/50 rounded-3xl" />
            <Skeleton className="h-48 md:col-span-1 bg-zinc-800/50 rounded-3xl" />
            <Skeleton className="h-48 md:col-span-1 bg-zinc-800/50 rounded-3xl" />
          </div>
          <Skeleton className="h-32 w-full mb-8 bg-zinc-800/50 rounded-3xl" />
          <Skeleton className="h-96 bg-zinc-800/50 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-emerald-500/30">
      <Helmet>
        <title>Panel Principal - LoboWallet</title>
        <meta
          name="description"
          content="Visualiza tu resumen financiero y administra tu dinero"
        />
      </Helmet>

      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="mb-10">
            <h1 className="text-3xl md:text-5xl font-extrabold mb-2 tracking-tight">
              Bienvenido de nuevo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">{currentUser?.name}</span>
            </h1>
            <p className="text-zinc-400 text-lg">
              Aquí tienes tu estado financiero actual.
            </p>
          </div>

          {/* Estadísticas principales (Bento Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

            {/* Tarjeta principal de balance */}
            <div className="md:col-span-2 relative overflow-hidden rounded-3xl interactive-hover group shadow-2xl border border-zinc-800/50">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-primary to-[#00B5E2] opacity-100 z-0 transition-transform duration-500 group-hover:scale-105"></div>
              
              <div className="p-8 relative z-10 flex flex-col h-full justify-between min-h-[200px]">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-white/80 font-bold text-sm tracking-widest uppercase">
                    Balance Global
                  </span>
                  <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                </div>

                <div>
                  <h2
                    className="text-5xl md:text-6xl font-extrabold text-white mb-2 tracking-tight"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    ${stats.balance.toFixed(2)}
                  </h2>
                  <p className="text-white/80 font-medium">
                    Fondos totales disponibles
                  </p>
                </div>
              </div>
            </div>

            {/* Ingresos */}
            <div className="bento-card p-8 flex flex-col h-full justify-between interactive-hover group">
              <div className="flex justify-between items-start mb-6">
                <span className="text-zinc-400 font-bold text-sm uppercase tracking-widest group-hover:text-emerald-400 transition-colors">
                  Ingresos
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <h3
                className="text-3xl md:text-4xl font-bold text-zinc-100"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                ${stats.totalIncome.toFixed(2)}
              </h3>
            </div>

            {/* Gastos */}
            <div className="bento-card p-8 flex flex-col h-full justify-between interactive-hover group">
              <div className="flex justify-between items-start mb-6">
                <span className="text-zinc-400 font-bold text-sm uppercase tracking-widest group-hover:text-rose-400 transition-colors">
                  Gastos
                </span>
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                  <TrendingDown className="w-5 h-5 text-rose-400" />
                </div>
              </div>
              <h3
                className="text-3xl md:text-4xl font-bold text-zinc-100"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                ${stats.totalExpenses.toFixed(2)}
              </h3>
            </div>
          </div>

          {/* MIS CUENTAS (Nueva Sección) */}
          {accounts.length > 0 && (
            <div className="mb-8">
              <h3 className="text-2xl font-bold px-1 text-zinc-100 mb-4">Mis Cuentas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.map(acc => (
                  <div key={acc.id} className="bento-card p-6 flex flex-col interactive-hover group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50 group-hover:bg-emerald-400 transition-colors"></div>
                    <div className="flex justify-between items-start mb-4 pl-2">
                      <span className="font-bold text-zinc-300 text-lg">{acc.name}</span>
                      <CreditCard className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h4 className="text-3xl font-extrabold text-white pl-2">
                      ${acc.balance.toFixed(2)}
                    </h4>
                    <span className="text-xs text-zinc-500 uppercase tracking-widest mt-2 font-medium pl-2">
                      {acc.type === 'debit' ? 'Débito' : acc.type === 'credit' ? 'Crédito' : 'Efectivo'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Segunda sección del Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

            {/* Acciones rápidas */}
            <div className="lg:col-span-1 space-y-6">
              <h3 className="text-2xl font-bold px-1 text-zinc-100">Acciones</h3>
              <div className="grid grid-cols-2 gap-4 h-[calc(100%-3rem)]">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <motion.div
                      key={action.title}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="h-full"
                    >
                      <Link
                        to={action.path}
                        className={`bento-card p-6 flex flex-col items-center justify-center h-full text-center transition-all duration-300 ${action.hoverBorder}`}
                      >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${action.color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-zinc-300 leading-tight text-sm">
                          {action.title}
                        </span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Transacciones recientes */}
            <div className="lg:col-span-2 bento-card p-8 flex flex-col">
              <div className="flex items-center justify-between border-b border-zinc-800/50 pb-6 mb-6">
                <h3 className="text-2xl font-bold text-zinc-100">
                  Transacciones Recientes
                </h3>
                <Button variant="link" className="text-emerald-400 hover:text-emerald-300 px-0" asChild>
                   <Link to="/transactions">Ver todas</Link>
                </Button>
              </div>

              <div className="flex-1">
                {recentTransactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-12">
                    <div className="w-20 h-20 rounded-full bg-zinc-800/50 flex items-center justify-center mb-6">
                       <Receipt className="w-10 h-10 text-zinc-500" />
                    </div>
                    <p className="text-zinc-400 text-lg mb-6 font-medium">
                      Tu historial está limpio.
                    </p>
                    <Button asChild size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold rounded-xl">
                      <Link to="/transactions">Registrar Movimiento</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentTransactions.map((transaction) => {
                      const categoryData = transaction.expand?.category;
                      const catName = categoryData?.name || 'Desconocida';
                      const catColor = categoryData?.color || '#a1a1aa';
                      const CatIcon = FLAT_ICONS[categoryData?.icon] || Tag;
                      const isIncome = transaction.type === 'income';

                      return (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 hover:bg-zinc-800/40 hover:border-zinc-700/50 transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 shadow-sm group-hover:scale-105 transition-transform"
                              style={{ borderColor: `${catColor}40` }}
                            >
                              <CatIcon
                                className="w-5 h-5"
                                style={{ color: catColor }}
                              />
                            </div>
                            <div>
                              <p className="font-bold text-zinc-100 text-base">
                                {catName}
                              </p>
                              <p className="text-sm text-zinc-500 font-medium">
                                {new Date(transaction.date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric', year: 'numeric' })}
                                {transaction.notes && ` • ${transaction.notes.substring(0, 20)}${transaction.notes.length > 20 ? '...' : ''}`}
                              </p>
                            </div>
                          </div>

                          <div
                            className={`font-extrabold text-lg tracking-tight ${
                              isIncome ? 'text-emerald-400' : 'text-zinc-100'
                            }`}
                          >
                            {isIncome ? '+' : '-'}${transaction.amount.toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default DashboardPage;