import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

import {
  Pencil,
  Trash2,
  Plus,
  CheckCircle2,
  Target,
  Trophy,
  CalendarClock
} from 'lucide-react';

import Header from '@/components/Header.jsx';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const SavingsGoalsPage = () => {
  const { currentUser } = useAuth();

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    goalName: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    description: '',
  });

  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, [currentUser.id]);

  const fetchGoals = async () => {
    try {
      const records = await pb
        .collection('savingsGoals')
        .getFullList({
          filter: `userId = "${currentUser.id}"`,
          sort: '-created',
          $autoCancel: false,
        });

      setGoals(records);
    } catch (error) {
      console.error('Error al obtener objetivos:', error);
      toast.error('Error al cargar objetivos de ahorro');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.goalName || !formData.targetAmount || !formData.deadline) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }

    if (parseFloat(formData.targetAmount) <= 0) {
      toast.error('La meta debe ser mayor a 0');
      return;
    }

    setSubmitting(true);

    try {
      const safeDate = new Date(formData.deadline).toISOString();

      const data = {
        userId: currentUser.id,
        goalName: formData.goalName,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: formData.currentAmount ? parseFloat(formData.currentAmount) : 0,
        deadline: safeDate,
        description: formData.description,
      };

      if (editingId) {
        await pb.collection('savingsGoals').update(editingId, data, { $autoCancel: false });
        toast.success('Objetivo actualizado');
      } else {
        data.completed = false;
        await pb.collection('savingsGoals').create(data, { $autoCancel: false });
        toast.success('Objetivo creado');
      }

      setFormData({
        goalName: '',
        targetAmount: '',
        currentAmount: '',
        deadline: '',
        description: '',
      });
      setEditingId(null);
      fetchGoals();
    } catch (error) {
      console.error('Error al guardar objetivo:', error);
      toast.error('Error al guardar objetivo');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (goal) => {
    setFormData({
      goalName: goal.goalName,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      deadline: goal.deadline ? goal.deadline.substring(0, 10) : '',
      description: goal.description || '',
    });

    setEditingId(goal.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este objetivo de ahorro?')) return;

    try {
      await pb.collection('savingsGoals').delete(id, { $autoCancel: false });
      toast.success('Objetivo eliminado');
      fetchGoals();
    } catch (error) {
      console.error('Error al eliminar objetivo:', error);
      toast.error('Error al eliminar objetivo');
    }
  };

  const handleToggleComplete = async (goal) => {
    try {
      await pb.collection('savingsGoals').update(
        goal.id,
        { completed: !goal.completed },
        { $autoCancel: false }
      );
      toast.success(goal.completed ? 'Objetivo devuelto a pendiente' : '¡Objetivo completado! 🎉');
      fetchGoals();
    } catch (error) {
      console.error('Error al actualizar objetivo:', error);
      toast.error('Error al actualizar objetivo');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50">
        <Helmet><title>Metas de Ahorro - LoboWallet</title></Helmet>
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
          <Skeleton className="h-10 w-64 mb-8 bg-zinc-800/50 rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton className="h-[500px] lg:col-span-2 bg-zinc-800/50 rounded-3xl" />
            <Skeleton className="h-[500px] bg-zinc-800/50 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-purple-500/30">
      <Helmet>
        <title>Metas de Ahorro - LoboWallet</title>
        <meta name="description" content="Realiza seguimiento de tus metas de ahorro y objetivos financieros" />
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
              Metas de <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Ahorro</span>
            </h1>
            <p className="text-zinc-400 text-lg">Define tus objetivos. Traza el plan. Conquista tu futuro.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Columna Principal - Lista de Objetivos */}
            <div className="lg:col-span-2">
              <div className="bento-card p-6 lg:p-8 min-h-full">
                <div className="border-b border-zinc-800/50 pb-4 mb-6">
                  <h2 className="text-2xl font-bold text-zinc-100">Tus Objetivos Activos</h2>
                </div>

                <div>
                  {goals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-20 h-20 rounded-full bg-zinc-800/50 flex items-center justify-center mb-6">
                        <Target className="w-10 h-10 text-zinc-500" />
                      </div>
                      <p className="text-zinc-400 text-lg font-medium">Sin objetivos en la mira.</p>
                      <p className="text-zinc-600 mt-2 max-w-sm">
                        ¿Un viaje? ¿Una nueva laptop? Crea tu primera meta y empieza a construirla hoy.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {goals.map((goal) => {
                        const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                        const daysUntilDeadline = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                        const isExpired = !goal.completed && daysUntilDeadline <= 0;

                        return (
                          <div
                            key={goal.id}
                            className={`p-5 rounded-2xl border transition-all group ${
                              goal.completed
                                ? 'bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/50'
                                : 'bg-zinc-900/40 border-zinc-800/50 hover:bg-zinc-800/40 hover:border-zinc-700/50'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1.5">
                                  <h3 className={`font-bold text-xl leading-tight ${goal.completed ? 'text-emerald-400' : 'text-zinc-100'}`}>
                                    {goal.goalName}
                                  </h3>
                                  {goal.completed && (
                                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                                      <Trophy className="w-3 h-3" />
                                      Logrado
                                    </div>
                                  )}
                                </div>

                                {goal.description && (
                                  <p className="text-sm text-zinc-400 mb-3 italic">
                                    "{goal.description}"
                                  </p>
                                )}

                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-400 font-medium">
                                  <p>
                                    <span className="text-zinc-200 font-bold">${goal.currentAmount.toFixed(2)}</span> reunidos de <span className="text-zinc-500">${goal.targetAmount.toFixed(2)}</span>
                                  </p>

                                  {!goal.completed && (
                                    <div className="flex items-center gap-1.5">
                                      <span className="hidden sm:inline text-zinc-700">•</span>
                                      <CalendarClock className={`w-4 h-4 ${isExpired ? 'text-rose-500' : 'text-zinc-500'}`} />
                                      <span className={isExpired ? 'text-rose-500 font-bold' : 'text-zinc-400'}>
                                        {isExpired ? 'Fecha límite vencida' : `${daysUntilDeadline} días restantes`}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex gap-2 self-end sm:self-start">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className={`h-9 w-9 rounded-xl transition-colors ${
                                    goal.completed 
                                      ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 hover:text-emerald-300' 
                                      : 'hover:bg-emerald-500/10 hover:text-emerald-400 text-zinc-500'
                                  }`}
                                  onClick={() => handleToggleComplete(goal)}
                                  title={goal.completed ? "Marcar como pendiente" : "Marcar como completado"}
                                >
                                  <CheckCircle2 className="w-5 h-5" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl hover:bg-cyan-500/10 hover:text-cyan-400 text-zinc-500 transition-colors" onClick={() => handleEdit(goal)}>
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl hover:bg-rose-500/10 hover:text-rose-400 text-zinc-500 transition-colors" onClick={() => handleDelete(goal.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            <Progress
                              value={percentage}
                              className={`h-3 bg-zinc-950 border border-zinc-800 rounded-full overflow-hidden ${
                                goal.completed
                                  ? '[&>div]:bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.2)]'
                                  : '[&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-cyan-400'
                              }`}
                            />

                            <div className="flex items-center justify-between mt-3 px-1">
                              <span className={`text-sm font-bold ${goal.completed ? 'text-emerald-400' : 'text-zinc-300'}`}>
                                {percentage.toFixed(0)}% completado
                              </span>
                              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                                Límite: {new Date(goal.deadline).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
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
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Target className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-zinc-100">
                    {editingId ? 'Editar Objetivo' : 'Nuevo Objetivo'}
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  <div className="space-y-2.5">
                    <Label htmlFor="goalName" className="text-zinc-300 font-bold">Nombre de la Meta</Label>
                    <Input
                      id="goalName"
                      type="text"
                      placeholder="Ej: Nueva laptop"
                      value={formData.goalName}
                      onChange={(e) => setFormData({ ...formData, goalName: e.target.value })}
                      className="bg-zinc-900 border-zinc-800 rounded-xl h-11 font-medium placeholder:text-zinc-600 text-zinc-200"
                      required
                    />
                  </div>

                  <div className="space-y-2.5">
                    <Label htmlFor="targetAmount" className="text-zinc-300 font-bold">Monto Objetivo</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-zinc-500 font-bold">$</span>
                      </div>
                      <Input
                        id="targetAmount"
                        type="number"
                        step="0.01" min="0.01"
                        placeholder="0.00"
                        value={formData.targetAmount}
                        onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                        className="pl-8 bg-zinc-900 border-zinc-800 rounded-xl h-11 font-semibold placeholder:text-zinc-600 text-zinc-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <Label htmlFor="currentAmount" className="text-zinc-300 font-bold">Monto Actual <span className="text-zinc-500 font-normal">(Progreso)</span></Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-zinc-500 font-bold">$</span>
                      </div>
                      <Input
                        id="currentAmount"
                        type="number"
                        step="0.01" min="0"
                        placeholder="0.00"
                        value={formData.currentAmount}
                        onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                        className="pl-8 bg-zinc-900 border-zinc-800 rounded-xl h-11 font-semibold placeholder:text-zinc-600 text-zinc-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <Label htmlFor="deadline" className="text-zinc-300 font-bold">Fecha Límite</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="bg-zinc-900 border-zinc-800 rounded-xl h-11 text-zinc-200 font-medium [color-scheme:dark]"
                      required
                    />
                  </div>

                  <div className="space-y-2.5">
                    <Label htmlFor="description" className="text-zinc-300 font-bold">Motivación <span className="text-zinc-500 font-normal">(Opcional)</span></Label>
                    <Textarea
                      id="description"
                      placeholder="¿Por qué es importante esta meta para ti?"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-zinc-900 border-zinc-800 rounded-xl text-zinc-200 resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="submit"
                      className={`flex-1 font-bold h-12 rounded-xl transition-all ${editingId ? 'bg-cyan-500 hover:bg-cyan-600 text-zinc-950' : 'bg-purple-500 hover:bg-purple-600 text-zinc-50'}`}
                      disabled={submitting}
                    >
                      {submitting ? 'Guardando...' : (editingId ? 'Actualizar Meta' : 'Crear Meta')}
                    </Button>

                    {editingId && (
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 px-6 rounded-xl border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-bold"
                        onClick={() => {
                          setEditingId(null);
                          setFormData({ goalName: '', targetAmount: '', currentAmount: '', deadline: '', description: '' });
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

export default SavingsGoalsPage;