import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  PieChart,
  Target,
  DollarSign,
  Tag
} from 'lucide-react';
import Header from '@/components/Header.jsx';
import { motion } from 'framer-motion';
import { FLAT_ICONS } from '@/lib/iconData.js';

const DashboardPage = () => {
  const { currentUser } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. MECANISMO DE AUTO-REPARACIÓN Y OBTENCIÓN DE CUENTAS
        let userAccounts = [];
        try {
          userAccounts = await pb.collection('accounts').getFullList({
            filter: `userId = "${currentUser.id}"`,
            sort: '-created',
            $autoCancel: false,
          });
          
          if (userAccounts.length === 0) {
            console.warn('LoboWallet Fix: El usuario no tiene cuentas. Creando cuenta predeterminada...');
            const defaultAccount = await pb.collection('accounts').create({
              name: 'Billetera Principal',
              type: 'debit',
              balance: 0,
              isDefault: true,
              userId: currentUser.id,
            });
            userAccounts.push(defaultAccount);
          }
          setAccounts(userAccounts);
        } catch (accountError) {
          console.error('Error en el control de auto-reparación de cuentas:', accountError);
        }

        // 2. OBTENER LAS TRANSACCIONES (Expandiendo categoría y cuenta)
        const records = await pb.collection('transactions').getFullList({
          filter: `userId = "${currentUser.id}"`,
          sort: '-date,-created',
          $autoCancel: false,
          expand: 'category,account',
        });

        setTransactions(records);

      } catch (error) {
        console.error('Error al obtener datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser.id]);

  // 3. LÓGICA DE FILTRADO Y MATEMÁTICAS EN TIEMPO REAL
  const filteredTransactions = useMemo(() => {
    if (selectedAccount === 'all') return transactions;
    return transactions.filter(t => t.account === selectedAccount);
  }, [transactions, selectedAccount]);

  const stats = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // El balance ahora lee el saldo real de las cuentas, no solo ingresos vs gastos
    const currentBalance = selectedAccount === 'all'
      ? accounts.reduce((sum, acc) => sum + acc.balance, 0)
      : accounts.find(a => a.id === selectedAccount)?.balance || 0;

    return { totalIncome: income, totalExpenses: expenses, balance: currentBalance };
  }, [filteredTransactions, accounts, selectedAccount]);

  const recentTransactions = filteredTransactions.slice(0, 8);

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
          <Skeleton className="h-96 bg-zinc-800/50 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-emerald-500/30">
      <Helmet>
        <title>Panel Principal - LoboWallet</title>
        <meta name="description" content="Visualiza tu resumen financiero y administra tu dinero" />
      </Helmet>

      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Cabecera y Selector de Cuentas */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold mb-2 tracking-tight">
                Bienvenido, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">{currentUser?.name}</span>
              </h1>
              <p className="text-zinc-400 text-lg">
                Aquí tienes tu estado financiero actual.
              </p>
            </div>
            
            <div className="w-full md:w-64">
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 rounded-xl h-12 text-zinc-100 font-bold focus:ring-emerald-500/50">
                  <SelectValue placeholder="Selecciona una cuenta" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 rounded-xl">
                  <SelectItem value="all" className="hover:bg-zinc-800 cursor-pointer text-emerald-400 font-bold">
                    🌐 Visión Global
                  </SelectItem>
                  {accounts.map(acc => (
                    <SelectItem key={acc.id} value={acc.id} className="hover:bg-zinc-800 cursor-pointer text-zinc-200">
                      {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Estadísticas principales (Bento Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

            {/* Tarjeta principal de balance */}
            <div className="md:col-span-2 relative overflow-hidden rounded-3xl interactive-hover group shadow-2xl border border-zinc-800/50">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-primary to-[#00B5E2] opacity-100 z-0 transition-transform duration-500 group-hover:scale-105"></div>
              
              <div className="p-8 relative z-10 flex flex-col h-full justify-between min-h-[200px]">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-white/80 font-bold text-sm tracking-widest uppercase">
                    Balance {selectedAccount === 'all' ? 'Total' : 'Disponible'}
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
                    {selectedAccount === 'all' ? 'Sumatoria de todas tus cuentas' : 'Fondos en cuenta seleccionada'}
                  </p>
                </div>
              </div>
            </div>

            {/* Ingresos (Estilo Bento) */}
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

            {/* Gastos (Estilo Bento) */}
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
                  <div className="flex flex-col items-center justify-center h-full py-12 text-center">
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
                      const accountData = transaction.expand?.account;
                      
                      const catName = categoryData?.name || 'Desconocida';
                      const catColor = categoryData?.color || '#a1a1aa'; 
                      const CatIcon = FLAT_ICONS[categoryData?.icon] || Tag;
                      
                      const accName = accountData?.name || 'Cuenta no asignada';
                      const isIncome = transaction.type === 'income';

                      return (
                        <div
                          key={transaction.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 hover:bg-zinc-800/40 hover:border-zinc-700/50 transition-all group gap-4 sm:gap-0"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 shadow-sm group-hover:scale-105 transition-transform"
                              style={{ borderColor: `${catColor}40` }}
                            >
                              <CatIcon className="w-5 h-5" style={{ color: catColor }} />
                            </div>
                            <div>
                              <p className="font-bold text-zinc-100 text-base">
                                {catName}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500 font-medium">
                                <span>{new Date(transaction.date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                <span className="hidden sm:inline text-zinc-700">•</span>
                                <span className="text-xs bg-zinc-800/80 px-2 py-0.5 rounded-md text-zinc-400 flex items-center gap-1">
                                  <Wallet className="w-3 h-3" /> {accName}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div
                            className={`font-extrabold text-lg tracking-tight self-end sm:self-auto ${
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