import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart as PieChartIcon
} from 'lucide-react';
import Header from '@/components/Header.jsx';
import { motion } from 'framer-motion';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

const MonthlySummaryPage = () => {
  const { currentUser } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [monthlyStats, setMonthlyStats] = useState({
    income: 0,
    expenses: 0,
    balance: 0,
  });

  const [categoryData, setCategoryData] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);

  // Paleta Neon/Pastel optimizada para fondos oscuros (Zinc-950)
  const COLORS = [
    '#34d399', // Emerald 400
    '#22d3ee', // Cyan 400
    '#c084fc', // Purple 400
    '#fb7185', // Rose 400
    '#facc15', // Amber 400
    '#818cf8', // Indigo 400
    '#2dd4bf'  // Teal 400
  ];

  useEffect(() => {
    fetchTransactions();
  }, [currentUser.id]);

  useEffect(() => {
    calculateMonthlyStats();
  }, [transactions, selectedMonth]);

  const fetchTransactions = async () => {
    try {
      const records = await pb.collection('transactions').getFullList({
        filter: `userId = "${currentUser.id}"`,
        sort: '-date',
        expand: 'category',
        $autoCancel: false,
      });

      setTransactions(records);
      calculateMonthlyTrends(records);

    } catch (error) {
      console.error('Error al obtener transacciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyStats = () => {
    const monthTransactions = transactions.filter(t =>
      t.date.startsWith(selectedMonth)
    );

    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    setMonthlyStats({
      income,
      expenses,
      balance: income - expenses,
    });

    const categoryTotals = {};

    monthTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        // 🚀 Accede al nombre real mediante el objeto expandido y agrega un valor de seguridad
        const catName = t.expand?.category?.name || 'Desconocida';
        
        categoryTotals[catName] =
          (categoryTotals[catName] || 0) + t.amount;
      });

    const chartData = Object.entries(categoryTotals).map(
      ([name, value]) => ({
        name,
        value: parseFloat(value.toFixed(2)),
      })
    );

    setCategoryData(chartData);
  };

  const calculateMonthlyTrends = (allTransactions) => {
    const monthlyData = {};

    allTransactions.forEach(t => {
      const month = t.date.slice(0, 7);

      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expenses: 0 };
      }

      if (t.type === 'income') {
        monthlyData[month].income += t.amount;
      } else {
        monthlyData[month].expenses += t.amount;
      }
    });

    const trends = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('es-MX', { month: 'short', year: '2-digit' }),
        income: parseFloat(data.income.toFixed(2)),
        expenses: parseFloat(data.expenses.toFixed(2)),
      }))
      .sort((a, b) => new Date(a.month) - new Date(b.month))
      .slice(-6);

    setMonthlyTrends(trends);
  };

  const getAvailableMonths = () => {
    const months = new Set(
      transactions.map(t => t.date.slice(0, 7))
    );

    if (months.size === 0) {
      months.add(new Date().toISOString().slice(0, 7));
    }

    return Array.from(months).sort().reverse();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50">
        <Helmet><title>Resumen Mensual - LoboWallet</title></Helmet>
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
          <Skeleton className="h-10 w-64 mb-8 bg-zinc-800/50 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Skeleton className="h-40 bg-zinc-800/50 rounded-3xl" />
            <Skeleton className="h-40 bg-zinc-800/50 rounded-3xl" />
            <Skeleton className="h-40 bg-zinc-800/50 rounded-3xl" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-[400px] bg-zinc-800/50 rounded-3xl" />
            <Skeleton className="h-[400px] bg-zinc-800/50 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  // Tooltip customizado oscuro para Recharts
  const customTooltipStyle = {
    backgroundColor: '#18181b', // zinc-900
    borderColor: '#27272a',     // zinc-800
    borderRadius: '1rem',
    color: '#f4f4f5',           // zinc-50
    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.5)',
    fontWeight: 'bold'
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-emerald-500/30">
      <Helmet>
        <title>Resumen Mensual - LoboWallet</title>
        <meta name="description" content="Visualiza tu resumen financiero mensual y el desglose de tus gastos" />
      </Helmet>

      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-100">
                Resumen <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Mensual</span>
              </h1>
              <p className="text-zinc-400 text-lg mt-2">Analiza tu progreso y ajusta tus estrategias.</p>
            </div>

            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full sm:w-[240px] bg-zinc-900 border-zinc-800 rounded-xl h-12 font-bold text-zinc-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 rounded-xl">
                {getAvailableMonths().map(month => (
                  <SelectItem key={month} value={month} className="hover:bg-zinc-800 cursor-pointer font-medium text-zinc-300">
                    {new Date(month + '-01').toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tarjetas Superiores (Bento Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            {/* Balance Neto */}
            <div className="bento-card p-6 flex flex-col justify-between interactive-hover group">
              <div className="flex justify-between items-start mb-6">
                <span className="text-zinc-400 font-bold text-sm uppercase tracking-widest group-hover:text-cyan-400 transition-colors">
                  Balance Neto
                </span>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                  <Wallet className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <div className={`text-3xl md:text-4xl font-extrabold tracking-tight ${monthlyStats.balance >= 0 ? 'text-zinc-100' : 'text-rose-400'}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
                ${monthlyStats.balance.toFixed(2)}
              </div>
            </div>

            {/* Ingresos */}
            <div className="bento-card p-6 flex flex-col justify-between interactive-hover group">
              <div className="flex justify-between items-start mb-6">
                <span className="text-zinc-400 font-bold text-sm uppercase tracking-widest group-hover:text-emerald-400 transition-colors">
                  Ingresos
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-extrabold text-emerald-400 tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>
                ${monthlyStats.income.toFixed(2)}
              </div>
            </div>

            {/* Gastos */}
            <div className="bento-card p-6 flex flex-col justify-between interactive-hover group">
              <div className="flex justify-between items-start mb-6">
                <span className="text-zinc-400 font-bold text-sm uppercase tracking-widest group-hover:text-rose-400 transition-colors">
                  Gastos
                </span>
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                  <TrendingDown className="w-5 h-5 text-rose-400" />
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-extrabold text-rose-400 tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>
                ${monthlyStats.expenses.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Gráfico circular */}
            <div className="bento-card p-6 lg:p-8 flex flex-col">
              <div className="border-b border-zinc-800/50 pb-4 mb-6">
                <h3 className="text-2xl font-bold text-zinc-100">Desglose de Gastos</h3>
              </div>

              <div className="flex-1 flex items-center justify-center">
                {categoryData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-12">
                     <div className="w-20 h-20 rounded-full bg-zinc-800/50 flex items-center justify-center mb-6">
                        <PieChartIcon className="w-10 h-10 text-zinc-500" />
                     </div>
                    <p className="text-zinc-400 text-lg font-medium">Historial intacto.</p>
                    <p className="text-zinc-600 mt-1">No hay gastos registrados en este mes.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={0} /* <-- Cambiamos de 5 a 0 */
                        labelLine={false}
                        stroke="none"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value.toFixed(2)}`} contentStyle={customTooltipStyle} itemStyle={{ color: '#f4f4f5' }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px', color: '#a1a1aa', fontWeight: 'bold' }}/>
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Tendencia mensual */}
            <div className="bento-card p-6 lg:p-8 flex flex-col">
              <div className="border-b border-zinc-800/50 pb-4 mb-6">
                <h3 className="text-2xl font-bold text-zinc-100">Proyección (6 Meses)</h3>
              </div>

              <div className="flex-1 flex items-center justify-center">
                {monthlyTrends.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-12">
                    <p className="text-zinc-400 text-lg font-medium">Recopilando datos.</p>
                    <p className="text-zinc-600 mt-1">Registra más movimientos para ver tus tendencias.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart
                      data={monthlyTrends}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#34d399" stopOpacity={0.5} />
                          <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#fb7185" stopOpacity={0.5} />
                          <stop offset="95%" stopColor="#fb7185" stopOpacity={0} />
                        </linearGradient>
                      </defs>

                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                      
                      <XAxis 
                        dataKey="month" 
                        tickLine={false} 
                        axisLine={false} 
                        tickMargin={12} 
                        tick={{ fill: '#71717a', fontSize: 12, fontWeight: 'bold' }} 
                      />
                      
                      <YAxis 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(val) => `$${val}`} 
                        tick={{ fill: '#71717a', fontSize: 12, fontWeight: 'bold' }} 
                      />

                      <Tooltip formatter={(value) => `$${value.toFixed(2)}`} contentStyle={customTooltipStyle} itemStyle={{ color: '#f4f4f5' }} />
                      <Legend verticalAlign="top" height={40} iconType="circle" wrapperStyle={{ paddingBottom: '10px', color: '#a1a1aa', fontWeight: 'bold' }}/>

                      <Area
                        type="monotone"
                        dataKey="income"
                        stroke="#34d399"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorIncome)"
                        name="Ingresos"
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#34d399' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="expenses"
                        stroke="#fb7185"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorExpenses)"
                        name="Gastos"
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#fb7185' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
            
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default MonthlySummaryPage;