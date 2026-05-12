import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, TrendingDown, Wallet, ArrowRight, 
  Receipt, PieChart, Target, DollarSign,
  Utensils, Car, Plane, Book, Zap, ShoppingBag, HelpCircle 
} from 'lucide-react';
import Header from '@/components/Header.jsx';
import { motion } from 'framer-motion';

const categoryIcons = {
  Food: Utensils,
  Transportation: Car,
  Entertainment: Plane,
  Education: Book,
  Utilities: Zap,
  Shopping: ShoppingBag,
  Other: HelpCircle
};

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const records = await pb.collection('transactions').getFullList({
          filter: `userId = "${currentUser.id}"`,
          sort: '-date,-created',
          $autoCancel: false,
        });

        setTransactions(records);

        const income = records
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const expenses = records
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        setStats({
          totalIncome: income,
          totalExpenses: expenses,
          balance: income - expenses,
        });
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser.id]);

  const recentTransactions = transactions.slice(0, 8);

  const quickActions = [
    { title: 'Add Transaction', path: '/transactions', icon: Receipt, color: 'text-primary bg-primary/10' },
    { title: 'Monthly Summary', path: '/monthly-summary', icon: PieChart, color: 'text-emerald-500 bg-emerald-500/10' },
    { title: 'Manage Budgets', path: '/budgets', icon: DollarSign, color: 'text-amber-500 bg-amber-500/10' },
    { title: 'Savings Goals', path: '/savings-goals', icon: Target, color: 'text-indigo-500 bg-indigo-500/10' },
  ];

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Dashboard - LoboWallet</title>
        </Helmet>
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Skeleton className="h-48 md:col-span-2" />
            <Skeleton className="h-48 md:col-span-1" />
            <Skeleton className="h-48 md:col-span-1" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - LoboWallet</title>
        <meta name="description" content="View your financial overview and manage your money" />
      </Helmet>
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Welcome back, {currentUser?.name}</h1>
          <p className="text-muted-foreground mb-8 text-lg">Here's your financial overview</p>

          {/* Top Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Main Balance Card - Spans 2 columns */}
            <Card className="md:col-span-2 border-0 shadow-xl overflow-hidden relative interactive-hover group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-primary to-[#00B5E2] opacity-100 z-0"></div>
              <CardContent className="p-8 relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-white/80 font-medium text-lg tracking-wide uppercase">Current Balance</span>
                  <Wallet className="w-8 h-8 text-white/90" />
                </div>
                <div>
                  <h2 className="text-5xl md:text-6xl font-bold text-white mb-2" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    ${stats.balance.toFixed(2)}
                  </h2>
                  <p className="text-white/80">Available funds right now</p>
                </div>
              </CardContent>
            </Card>

            {/* Income Card */}
            <Card className="bg-card shadow-lg interactive-hover border-b-4 border-b-[#10B981]">
              <CardContent className="p-6 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-muted-foreground font-medium text-sm uppercase tracking-wide">Total Income</span>
                  <div className="w-10 h-10 rounded-full bg-[#10B981]/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-[#10B981]" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  ${stats.totalIncome.toFixed(2)}
                </h3>
              </CardContent>
            </Card>

            {/* Expense Card */}
            <Card className="bg-card shadow-lg interactive-hover border-b-4 border-b-[#EF4444]">
              <CardContent className="p-6 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-muted-foreground font-medium text-sm uppercase tracking-wide">Total Expenses</span>
                  <div className="w-10 h-10 rounded-full bg-[#EF4444]/10 flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-[#EF4444]" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  ${stats.totalExpenses.toFixed(2)}
                </h3>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Quick Actions - Converted to Icon Cards */}
            <div className="lg:col-span-1 space-y-6">
              <h3 className="text-xl font-bold">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <motion.div
                      key={action.title}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Link 
                        to={action.path}
                        className="flex flex-col items-center justify-center p-6 h-full bg-card rounded-2xl shadow-sm border interactive-hover text-center"
                      >
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${action.color}`}>
                          <Icon className="w-7 h-7" />
                        </div>
                        <span className="font-semibold text-foreground leading-tight text-sm md:text-base">
                          {action.title}
                        </span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Recent Transactions */}
            <Card className="lg:col-span-2 shadow-lg border-0 bg-card">
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-xl font-bold">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {recentTransactions.length === 0 ? (
                  <div className="text-center py-12">
                    <Receipt className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg mb-6">No transactions yet</p>
                    <Button asChild size="lg" className="rounded-full">
                      <Link to="/transactions">Add your first transaction</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentTransactions.map((transaction) => {
                      const CatIcon = categoryIcons[transaction.category] || categoryIcons.Other;
                      const isIncome = transaction.type === 'income';
                      
                      return (
                        <div key={transaction.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                              isIncome ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-muted text-muted-foreground'
                            }`}>
                              <CatIcon className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="font-bold text-foreground text-base">{transaction.category}</p>
                              <p className="text-sm text-muted-foreground font-medium">
                                {new Date(transaction.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          <div className={`text-lg font-bold ${isIncome ? 'text-[#10B981]' : 'text-[#EF4444]'}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
                            {isIncome ? '+' : '-'}${transaction.amount.toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                    <div className="pt-4 mt-2 border-t">
                      <Button variant="ghost" className="w-full text-muted-foreground hover:text-primary" asChild>
                        <Link to="/transactions">
                          View all transactions
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default DashboardPage;