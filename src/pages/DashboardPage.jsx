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
  Tag,
  Plus,
  Minus,
  PieChart as PieChartIcon
} from 'lucide-react';
import Header from '@/components/Header.jsx';
import { motion } from 'framer-motion';
import { FLAT_ICONS } from '@/lib/iconData.js';
// Importamos Recharts
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// Paleta premium de respaldo por si la base de datos no tiene colores
const PREMIUM_COLORS = ['#10b981', '#0ea5e9', '#f43f5e', '#eab308', '#a855f7', '#f97316', '#06b6d4'];
const DashboardPage = () => {
  const { currentUser } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let userAccounts = [];
        try {
          userAccounts = await pb.collection('accounts').getFullList({
            filter: `userId = "${currentUser.id}"`,
            sort: '-created',
            $autoCancel: false,
          });
          
          if (userAccounts.length === 0) {
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
          console.error('Error en el control de cuentas:', accountError);
        }

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

    const currentBalance = selectedAccount === 'all'
      ? accounts.reduce((sum, acc) => sum + acc.balance, 0)
      : accounts.find(a => a.id === selectedAccount)?.balance || 0;

    return { totalIncome: income, totalExpenses: expenses, balance: currentBalance };
  }, [filteredTransactions, accounts, selectedAccount]);

  // LÓGICA NIVEL DIOS: Agrupar gastos por categoría y sumar montos
  // LÓGICA NIVEL DIOS: Agrupar gastos, sumar montos y asegurar colores vibrantes
  const expensesByCategory = useMemo(() => {
    const expenses = filteredTransactions.filter(t => t.type === 'expense');
    
    const grouped = expenses.reduce((acc, curr) => {
      const catName = curr.expand?.category?.name || 'Otros Gastos'; // Cambiamos "Desconocida" por "Otros Gastos"
      
      if (!acc[catName]) {
        // Asignamos un color de la base de datos, o uno vibrante de nuestra paleta si no existe
        const dbColor = curr.expand?.category?.color;
        const colorIndex = Object.keys(acc).length % PREMIUM_COLORS.length;
        const finalColor = (dbColor && dbColor !== '#3f3f46') ? dbColor : PREMIUM_COLORS[colorIndex];

        acc[catName] = { name: catName, value: 0, color: finalColor };
      }
      acc[catName].value += curr.amount;
      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const recentTransactions = filteredTransactions.slice(0, 5);

  // Tooltip personalizado para la gráfica
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-zinc-900/95 border border-zinc-700/50 p-4 rounded-2xl shadow-2xl backdrop-blur-md outline-none">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: data.color }}></span>
            <p className="text-zinc-300 font-bold text-sm uppercase tracking-wider">{data.name}</p>
          </div>
          <p className="text-zinc-100 font-extrabold text-2xl tracking-tight">
            ${data.value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50">
        <Helmet><title>Panel Principal - LoboWallet</title></Helmet>
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
      </Helmet>

      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold mb-2 tracking-tight">
                Bienvenido, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">{currentUser?.name}</span>
              </h1>
              <p className="text-zinc-400 text-lg">Aquí tienes tu estado financiero actual.</p>
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                  <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-2 tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    ${stats.balance.toFixed(2)}
                  </h2>
                  <p className="text-white/80 font-medium">
                    {selectedAccount === 'all' ? 'Sumatoria de todas tus cuentas' : 'Fondos en cuenta seleccionada'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bento-card p-6 flex flex-col h-full justify-between interactive-hover group">
              <div className="flex justify-between items-center mb-4">
                <span className="text-zinc-400 font-bold text-sm uppercase tracking-widest group-hover:text-emerald-400 transition-colors">Ingresos</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
              <div className="flex justify-between items-end">
                <h3 className="text-3xl md:text-4xl font-bold text-zinc-100" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  ${stats.totalIncome.toFixed(2)}
                </h3>
                <Button asChild size="icon" variant="ghost" className="h-10 w-10 rounded-full bg-zinc-800/50 hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-400 border border-zinc-700/50 hover:border-emerald-500/50 transition-all shadow-sm">
                  <Link to="/transactions?type=income" title="Agregar Ingreso"><Plus className="w-5 h-5" /></Link>
                </Button>
              </div>
            </div>

            <div className="bento-card p-6 flex flex-col h-full justify-between interactive-hover group">
              <div className="flex justify-between items-center mb-4">
                <span className="text-zinc-400 font-bold text-sm uppercase tracking-widest group-hover:text-rose-400 transition-colors">Gastos</span>
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                  <TrendingDown className="w-4 h-4 text-rose-400" />
                </div>
              </div>
              <div className="flex justify-between items-end">
                <h3 className="text-3xl md:text-4xl font-bold text-zinc-100" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  ${stats.totalExpenses.toFixed(2)}
                </h3>
                <Button asChild size="icon" variant="ghost" className="h-10 w-10 rounded-full bg-zinc-800/50 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 border border-zinc-700/50 hover:border-rose-500/50 transition-all shadow-sm">
                  <Link to="/transactions?type=expense" title="Agregar Gasto"><Minus className="w-5 h-5" /></Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

            {/* GRÁFICA DE DONA (NIVEL DIOS SUPREMO) */}
            <div className="lg:col-span-2 bento-card p-6 flex flex-col min-h-[380px] group">
              <div className="flex items-center justify-between mb-2 shrink-0">
                <h3 className="text-xl font-bold text-zinc-100">Distribución de Gastos</h3>
                <span className="text-xs font-bold bg-zinc-800/80 text-zinc-400 px-3 py-1 rounded-md border border-zinc-700/50 uppercase tracking-widest">
                  Por Categoría
                </span>
              </div>
              
              {expensesByCategory.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mb-4">
                     <PieChartIcon className="w-8 h-8 text-zinc-500" />
                  </div>
                  <p className="text-zinc-400 text-sm max-w-xs">No hay gastos registrados. Agrega tus primeros movimientos para generar tu mapa financiero.</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col md:flex-row items-center gap-6 mt-4">
                  
                  {/* LADO IZQUIERDO: La Gráfica */}
                  <div className="relative w-full md:w-1/2 h-[250px] flex items-center justify-center shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                        <Pie
                          data={expensesByCategory}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}  
                          outerRadius={115} 
                          paddingAngle={5}  
                          dataKey="value"
                          stroke="none"     
                        >
                          {expensesByCategory.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.color} 
                              style={{ 
                                filter: `drop-shadow(0px 4px 10px ${entry.color}40)`,
                                transition: 'all 0.3s ease'
                              }} 
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    
                    {/* TEXTO EN EL HUECO DE LA DONA */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">
                        Gastado
                      </span>
                      <span className="text-2xl font-extrabold text-zinc-100 tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        ${stats.totalExpenses.toFixed(0)}
                      </span>
                    </div>
                  </div>

                  {/* LADO DERECHO: Leyenda Desglosada con Micro-Barras */}
                  <div className="w-full md:w-1/2 flex flex-col gap-3 max-h-[250px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#3f3f46 transparent' }}>
                    {expensesByCategory.map((category, index) => {
                      const percentage = ((category.value / stats.totalExpenses) * 100).toFixed(1);
                      
                      return (
                        <div 
                          key={index} 
                          className="relative overflow-hidden flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/50 hover:border-zinc-600 transition-colors group/item"
                        >
                          {/* 🪄 LA MAGIA: Barra de progreso de fondo */}
                          <div 
                            className="absolute left-0 top-0 bottom-0 opacity-[0.15] transition-all duration-700 ease-out" 
                            style={{ width: `${percentage}%`, backgroundColor: category.color }}
                          ></div>

                          <div className="relative z-10 flex items-center gap-3 overflow-hidden">
                            <div 
                              className="w-3 h-3 rounded-full shrink-0 shadow-md group-hover/item:scale-125 transition-transform" 
                              style={{ 
                                backgroundColor: category.color,
                                boxShadow: `0 0 10px ${category.color}80` 
                              }}
                            ></div>
                            <span className="font-bold text-sm text-zinc-200 truncate group-hover/item:text-white transition-colors">{category.name}</span>
                          </div>
                          
                          <div className="relative z-10 flex items-center gap-3 shrink-0 pl-2">
                            <span className="font-extrabold text-zinc-100 text-sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
                              ${category.value.toFixed(2)}
                            </span>
                            <span 
                              className="text-xs font-bold px-2 py-0.5 rounded-md text-zinc-950" 
                              style={{ backgroundColor: category.color, fontVariantNumeric: 'tabular-nums' }}
                            >
                              {percentage}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}
            </div>

            {/* Transacciones recientes */}
            <div className="lg:col-span-1 bento-card p-6 flex flex-col h-full min-h-[380px]">
              <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4 mb-4 shrink-0">
                <h3 className="text-lg font-bold text-zinc-100">Recientes</h3>
                <Button variant="link" className="text-emerald-400 hover:text-emerald-300 px-0 h-auto text-sm" asChild>
                   <Link to="/transactions">Ver más</Link>
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#3f3f46 transparent' }}>
                {recentTransactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center mb-3">
                       <Receipt className="w-6 h-6 text-zinc-500" />
                    </div>
                    <p className="text-zinc-400 text-sm mb-3 font-medium">Tu historial está limpio.</p>
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
                        <div key={transaction.id} className="flex items-center justify-between p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 hover:bg-zinc-800/40 hover:border-zinc-700/50 transition-all group">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 shadow-sm group-hover:scale-105 transition-transform shrink-0" style={{ borderColor: `${catColor}40` }}>
                              <CatIcon className="w-4 h-4" style={{ color: catColor }} />
                            </div>
                            <div className="truncate">
                              <p className="font-bold text-zinc-100 text-sm truncate">{catName}</p>
                              <p className="text-xs text-zinc-500 font-medium">{new Date(transaction.date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}</p>
                            </div>
                          </div>
                          <div className={`font-extrabold text-sm tracking-tight shrink-0 pl-2 ${isIncome ? 'text-emerald-400' : 'text-zinc-100'}`}>
                            {isIncome ? '+' : '-'}${transaction.amount.toFixed(0)}
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