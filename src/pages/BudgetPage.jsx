import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

import {
  Pencil,
  Trash2,
  Plus,
  AlertTriangle,
  Shield,
  Tag
} from 'lucide-react';

import Header from '@/components/Header.jsx';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

// Integración de los iconos personalizados para las categorías
import { FLAT_ICONS } from '@/lib/iconData.js';

const BudgetPage = () => {
  const { currentUser } = useAuth();

  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    category: '',
    monthlyLimit: '',
  });

  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [currentUser.id]);

  const fetchData = async () => {
    try {
      const [
        budgetRecords,
        transactionRecords,
        categoryRecords
      ] = await Promise.all([
        pb.collection('budgets').getFullList({
          filter: `userId = "${currentUser.id}"`,
          expand: 'category',
          $autoCancel: false,
        }),
        pb.collection('transactions').getFullList({
          filter: `userId = "${currentUser.id}"`,
          $autoCancel: false,
        }),
        pb.collection('categories').getFullList({
          filter: `userId = "${currentUser.id}" && type = "expense"`,
          $autoCancel: false,
        })
      ]);

      setBudgets(budgetRecords);
      setTransactions(transactionRecords);
      setCategories(categoryRecords);

      if (categoryRecords.length > 0 && !formData.category) {
        setFormData(prev => ({
          ...prev,
          category: categoryRecords[0].id
        }));
      }

    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentMonthSpending = (categoryId) => {
    const currentMonth = new Date().toISOString().slice(0, 7);

    return transactions
      .filter(t =>
        t.type === 'expense' &&
        t.category === categoryId &&
        t.date.startsWith(currentMonth)
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.monthlyLimit || parseFloat(formData.monthlyLimit) <= 0) {
      toast.error('Ingresa un monto válido');
      return;
    }

    if (!formData.category) {
      toast.error('Selecciona una categoría');
      return;
    }

    setSubmitting(true);

    try {
      const data = {
        userId: currentUser.id,
        category: formData.category,
        monthlyLimit: parseFloat(formData.monthlyLimit),
      };

      if (editingId) {
        await pb.collection('budgets').update(editingId, data, { $autoCancel: false });
        toast.success('Presupuesto actualizado');
      } else {
        const existing = budgets.find(b => b.category === formData.category);
        if (existing) {
          toast.error('Ya existe un presupuesto para esta categoría');
          setSubmitting(false);
          return;
        }

        await pb.collection('budgets').create(data, { $autoCancel: false });
        toast.success('Presupuesto creado');
      }

      setFormData({
        category: categories.length > 0 ? categories[0].id : '',
        monthlyLimit: ''
      });
      setEditingId(null);
      fetchData();

    } catch (error) {
      console.error('Error al guardar presupuesto:', error);
      toast.error('Error al guardar presupuesto');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (budget) => {
    setFormData({
      category: budget.category,
      monthlyLimit: budget.monthlyLimit.toString(),
    });
    setEditingId(budget.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este presupuesto?')) return;

    try {
      await pb.collection('budgets').delete(id, { $autoCancel: false });
      toast.success('Presupuesto eliminado');
      fetchData();
    } catch (error) {
      console.error('Error al eliminar presupuesto:', error);
      toast.error('Error al eliminar presupuesto');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50">
        <Helmet><title>Presupuestos - LoboWallet</title></Helmet>
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
          <Skeleton className="h-10 w-64 mb-8 bg-zinc-800/50 rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton className="h-[500px] lg:col-span-2 bg-zinc-800/50 rounded-3xl" />
            <Skeleton className="h-[400px] bg-zinc-800/50 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-emerald-500/30">
      <Helmet>
        <title>Presupuestos - LoboWallet</title>
        <meta name="description" content="Administra tus presupuestos mensuales y controla tus gastos" />
      </Helmet>

      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="mb-10">
            <h1 className="text-3xl md:text-5xl font-extrabold mb-2 tracking-tight text-zinc-100">
              Presupuestos <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Blindados</span>
            </h1>
            <p className="text-zinc-400 text-lg">Asigna límites estrictos y evita quedar en ceros antes de fin de mes.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Columna Principal - Lista de Presupuestos */}
            <div className="lg:col-span-2">
              <div className="bento-card p-6 lg:p-8 min-h-full">
                <div className="border-b border-zinc-800/50 pb-4 mb-6">
                  <h2 className="text-2xl font-bold text-zinc-100">Límites Activos</h2>
                </div>

                <div>
                  {budgets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-20 h-20 rounded-full bg-zinc-800/50 flex items-center justify-center mb-6">
                        <Shield className="w-10 h-10 text-zinc-500" />
                      </div>
                      <p className="text-zinc-400 text-lg font-medium">Aún no hay defensas configuradas.</p>
                      <p className="text-zinc-600 mt-2 max-w-sm">
                        Crea tu primer presupuesto para comenzar a controlar cuánto gastas en cada categoría.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {budgets.map((budget) => {
                        const spent = getCurrentMonthSpending(budget.category);
                        const percentage = (spent / budget.monthlyLimit) * 100;
                        const isWarning = percentage >= 80 && percentage <= 100;
                        const isOver = percentage > 100;

                        const categoryData = budget.expand?.category;
                        const categoryName = categoryData?.name || 'Desconocida';
                        const catColor = categoryData?.color || '#a1a1aa';
                        const IconComponent = FLAT_ICONS[categoryData?.icon] || Tag;

                        return (
                          <div key={budget.id} className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 hover:bg-zinc-800/40 hover:border-zinc-700/50 transition-all">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                              
                              <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-zinc-950 border shadow-sm" style={{ borderColor: `${catColor}40` }}>
                                  <IconComponent className="w-5 h-5" style={{ color: catColor }} />
                                </div>
                                <div>
                                  <h3 className="font-bold text-zinc-100 text-lg leading-tight">{categoryName}</h3>
                                  <p className="text-sm text-zinc-400 font-medium mt-1">
                                    <span className="text-zinc-300 font-bold">${spent.toFixed(2)}</span> consumidos de <span className="text-zinc-500">${budget.monthlyLimit.toFixed(2)}</span>
                                  </p>
                                </div>
                              </div>

                              <div className="flex gap-2 self-end sm:self-auto">
                                <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl hover:bg-cyan-500/10 hover:text-cyan-400 text-zinc-500 transition-colors" onClick={() => handleEdit(budget)}>
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl hover:bg-rose-500/10 hover:text-rose-400 text-zinc-500 transition-colors" onClick={() => handleDelete(budget.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            <Progress
                              value={Math.min(percentage, 100)}
                              className={`h-2.5 bg-zinc-950 border border-zinc-800 ${
                                isOver
                                  ? '[&>div]:bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                                  : isWarning
                                  ? '[&>div]:bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                                  : '[&>div]:bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]'
                              }`}
                            />

                            <div className="flex items-center justify-between mt-3">
                              <span className="text-sm font-bold text-zinc-500">
                                {percentage.toFixed(0)}% ocupado
                              </span>

                              {(isWarning || isOver) && (
                                <div className="flex items-center gap-1.5 text-sm bg-zinc-950 px-2.5 py-1 rounded-md border border-zinc-800">
                                  <AlertTriangle className={`w-4 h-4 ${isOver ? 'text-rose-500' : 'text-amber-400'}`} />
                                  <span className={`font-bold ${isOver ? 'text-rose-500' : 'text-amber-400'}`}>
                                    {isOver ? 'Límite Quebrado' : 'Zona de Riesgo'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Columna Lateral - Formulario */}
            <div>
              <div className="bento-card p-6 lg:p-8 lg:sticky lg:top-24 shadow-2xl">
                <div className="flex items-center gap-3 mb-6 border-b border-zinc-800/50 pb-4">
                  <div className="p-2 rounded-xl bg-zinc-800/50 text-zinc-300">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-zinc-100">
                    {editingId ? 'Modificar Límite' : 'Nuevo Límite'}
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  <div className="space-y-3">
                    <Label className="text-zinc-300 font-bold">Categoría a Blindar</Label>
                    <div className="flex gap-2 items-center">
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                        disabled={!!editingId}
                      >
                        <SelectTrigger className="flex-1 bg-zinc-900 border-zinc-800 rounded-xl h-12 text-zinc-200">
                          <SelectValue placeholder="Selecciona..." />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 rounded-xl">
                          {categories.map(cat => {
                            const IconComponent = FLAT_ICONS[cat.icon] || Tag;
                            return (
                              <SelectItem key={cat.id} value={cat.id} className="hover:bg-zinc-800 cursor-pointer font-medium text-zinc-300">
                                <div className="flex items-center gap-2">
                                  <IconComponent className="w-4 h-4" style={{ color: cat.color }} />
                                  {cat.name}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>

                      <Link to="/categories">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-12 h-12 rounded-xl border-zinc-700 hover:bg-zinc-800 shrink-0"
                          disabled={!!editingId}
                          title="Añadir categoría"
                        >
                          <Plus className="w-5 h-5 text-zinc-300" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="monthlyLimit" className="text-zinc-300 font-bold">Límite Mensual Máximo</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-zinc-500 font-bold">$</span>
                      </div>
                      <Input
                        id="monthlyLimit"
                        type="number"
                        step="0.01" min="0.01"
                        placeholder="0.00"
                        value={formData.monthlyLimit}
                        onChange={(e) => setFormData({ ...formData, monthlyLimit: e.target.value })}
                        className="pl-8 bg-zinc-900 border-zinc-800 rounded-xl h-12 text-lg font-semibold placeholder:text-zinc-600 text-zinc-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="submit"
                      className={`flex-1 font-bold h-12 rounded-xl transition-all ${editingId ? 'bg-cyan-500 hover:bg-cyan-600 text-zinc-950' : 'bg-emerald-500 hover:bg-emerald-600 text-zinc-950'}`}
                      disabled={submitting}
                    >
                      {submitting ? 'Asegurando...' : (editingId ? 'Actualizar' : 'Blindar Categoría')}
                    </Button>

                    {editingId && (
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 px-6 rounded-xl border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-bold"
                        onClick={() => {
                          setEditingId(null);
                          setFormData({ category: categories.length > 0 ? categories[0].id : '', monthlyLimit: '' });
                        }}
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>

                </form>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default BudgetPage;