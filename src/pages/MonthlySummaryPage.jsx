import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import Header from '@/components/Header.jsx';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';

const MonthlySummaryPage = () => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [monthlyStats, setMonthlyStats] = useState({
    income: 0,
    expenses: 0,
    balance: 0,
  });
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);

  const COLORS = ['#0EA5E9', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6', '#EC4899', '#14B8A6'];

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
        $autoCancel: false,
      });
      setTransactions(records);
      calculateMonthlyTrends(records);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyStats = () => {
    const monthTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));
    
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
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

    const chartData = Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
    }));

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
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        income: parseFloat(data.income.toFixed(2)),
        expenses: parseFloat(data.expenses.toFixed(2)),
      }))
      .sort((a, b) => new Date(a.month) - new Date(b.month))
      .slice(-6);

    setMonthlyTrends(trends);
  };

  const getAvailableMonths = () => {
    const months = new Set(transactions.map(t => t.date.slice(0, 7)));
    // If no transactions exist, ensure at least current month is selectable
    if (months.size === 0) {
      months.add(new Date().toISOString().slice(0, 7));
    }
    return Array.from(months).sort().reverse();
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Monthly Summary - LoboWallet</title>
        </Helmet>
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Monthly Summary - LoboWallet</title>
        <meta name="description" content="View your monthly financial summary and spending breakdown" />
      </Helmet>
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Monthly Summary</h1>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-56 h-12 text-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {getAvailableMonths().map(month => (
                <SelectItem key={month} value={month}>
                  {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-card interactive-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Net Balance</CardTitle>
              <Wallet className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={`text-4xl font-bold ${monthlyStats.balance >= 0 ? 'text-foreground' : 'text-[#EF4444]'}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
                ${monthlyStats.balance.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-card interactive-hover border-b-4 border-b-[#10B981]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Total Income</CardTitle>
              <TrendingUp className="w-5 h-5 text-[#10B981]" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-[#10B981]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                ${monthlyStats.income.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-card interactive-hover border-b-4 border-b-[#EF4444]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Total Expenses</CardTitle>
              <TrendingDown className="w-5 h-5 text-[#EF4444]" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-[#EF4444]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                ${monthlyStats.expenses.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pie Chart Card */}
          <Card className="shadow-xl border-0 bg-card">
            <CardHeader>
              <CardTitle className="text-xl">Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryData.length === 0 ? (
                <div className="py-8">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[{ name: 'Empty', value: 1 }]}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={100}
                        fill="currentColor"
                        className="text-muted/50"
                        stroke="none"
                        dataKey="value"
                      />
                      <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-sm font-medium">
                        <tspan x="50%" dy="0">Sin gastos registrados</tspan>
                        <tspan x="50%" dy="20">este mes</tspan>
                      </text>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => `$${value.toFixed(2)}`}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Area Chart Card */}
          <Card className="shadow-xl border-0 bg-card">
            <CardHeader>
              <CardTitle className="text-xl">6-Month Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyTrends.length === 0 ? (
                <div className="text-center py-24">
                  <p className="text-muted-foreground text-lg">Not enough data to display trends</p>
                </div>
              ) : (
                <div className="pt-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} className="text-xs font-medium fill-muted-foreground" />
                      <YAxis tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} className="text-xs font-medium fill-muted-foreground" />
                      <Tooltip 
                        formatter={(value) => `$${value.toFixed(2)}`}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Area 
                        type="monotone" 
                        dataKey="income" 
                        stroke="#10B981" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorIncome)" 
                        name="Income" 
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="expenses" 
                        stroke="#EF4444" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorExpenses)" 
                        name="Expenses" 
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default MonthlySummaryPage;