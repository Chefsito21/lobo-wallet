import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

import { Trash2, Plus, ArrowUpCircle, ArrowDownCircle, Tag, Layers } from 'lucide-react';
import Header from '@/components/Header.jsx';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

import { COLORS, ICON_CATEGORIES, FLAT_ICONS } from '@/lib/iconData.js';

const CategoriesPage = () => {
  const { currentUser } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    icon: 'ShoppingBag',
    color: '#3b82f6', // Color azul por defecto
    plannedAmount: ''
  });

  useEffect(() => {
    fetchCategories();
  }, [currentUser.id]);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      icon: prev.type === 'expense' ? 'ShoppingBag' : 'Wallet',
      color: prev.type === 'expense' ? '#ef4444' : '#10b981' // rose-500 / emerald-500
    }));
  }, [formData.type]);

  const fetchCategories = async () => {
    try {
      const records = await pb.collection('categories').getFullList({
        filter: `userId = "${currentUser.id}"`,
        sort: '-created',
      });
      setCategories(records);
    } catch (error) {
      toast.error('Error al cargar categorías');
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Nombre obligatorio');

    setSubmitting(true);
    try {
      const categoryData = {
        userId: currentUser.id,
        name: formData.name,
        type: formData.type,
        icon: formData.icon,
        color: formData.color,
        plannedAmount: formData.plannedAmount ? parseFloat(formData.plannedAmount) : 0
      };

      await pb.collection('categories').create(categoryData);
      toast.success('Clasificación añadida a tu arsenal');

      setFormData({ name: '', type: 'expense', icon: 'ShoppingBag', color: '#ef4444', plannedAmount: '' });
      fetchCategories();
    } catch (error) {
      console.error('Failed to save category:', error);
      toast.error('Error al guardar');
    } finally { 
      setSubmitting(false); 
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta categoría? Nota: Las transacciones asociadas podrían perder su etiqueta visual.')) return;
    try {
      await pb.collection('categories').delete(id);
      toast.success('Categoría eliminada');
      fetchCategories();
    } catch (error) {
      toast.error('Error al eliminar la categoría');
    }
  };

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50">
        <Helmet><title>Categorías - LoboWallet</title></Helmet>
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
          <Skeleton className="h-10 w-64 mb-8 bg-zinc-800/50 rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton className="h-[600px] lg:col-span-1 bg-zinc-800/50 rounded-3xl" />
            <Skeleton className="h-[600px] lg:col-span-2 bg-zinc-800/50 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-emerald-500/30">
      <Helmet>
        <title>Categorías - LoboWallet</title>
        <meta name="description" content="Personaliza cómo clasificas tu dinero." />
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
              Sistema de <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Etiquetas</span>
            </h1>
            <p className="text-zinc-400 text-lg">Personaliza cómo rastreas cada centavo de tu imperio.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Columna Izquierda - Formulario de Creación */}
            <div className="lg:col-span-1">
              <div className="bento-card p-6 lg:p-8 lg:sticky lg:top-24 shadow-2xl">
                <div className="flex items-center gap-3 mb-6 border-b border-zinc-800/50 pb-4">
                  <div className="p-2 rounded-xl bg-zinc-800/50 text-zinc-300 border border-zinc-700/50">
                    <Plus className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-zinc-100">Nueva Categoría</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Selector de Tipo Píldora */}
                  <div className="grid grid-cols-2 gap-2 p-1.5 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'expense' })}
                      className={`py-2.5 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                        formData.type === 'expense' 
                          ? 'bg-zinc-800 text-rose-400 shadow-md border border-zinc-700/50' 
                          : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'
                      }`}
                    >
                      <ArrowDownCircle className="w-4 h-4" /> Gasto
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'income' })}
                      className={`py-2.5 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                        formData.type === 'income' 
                          ? 'bg-zinc-800 text-emerald-400 shadow-md border border-zinc-700/50' 
                          : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'
                      }`}
                    >
                      <ArrowUpCircle className="w-4 h-4" /> Ingreso
                    </button>
                  </div>
                  
                  <div className="space-y-2.5">
                    <Label className="text-zinc-300 font-bold">Nombre de la Etiqueta</Label>
                    <Input 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="Ej: Tacos, Salario, Netflix..."
                      className="bg-zinc-900 border-zinc-800 rounded-xl h-11 font-medium placeholder:text-zinc-600 text-zinc-200"
                    />
                  </div>
                  
                  <div className="space-y-2.5">
                    <Label className="text-zinc-300 font-bold">Identidad Visual (Color)</Label>
                    <div className="flex flex-wrap gap-2.5 mt-2 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50">
                      {COLORS.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData({ ...formData, color })}
                          className={`w-7 h-7 rounded-full shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 focus:ring-zinc-500 ${
                            formData.color === color ? 'scale-125 ring-2 ring-white/20 shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'hover:scale-110 opacity-80 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <Label className="text-zinc-300 font-bold">Icono</Label>
                    <div className="h-48 overflow-y-auto border border-zinc-800/50 rounded-xl p-3 bg-zinc-900/50 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                      {Object.entries(ICON_CATEGORIES).map(([categoryName, icons]) => (
                        <div key={categoryName} className="mb-4 last:mb-0">
                          <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 sticky top-0 bg-zinc-900/90 backdrop-blur-sm py-1.5 z-10 rounded-sm">
                            {categoryName}
                          </h4>
                          <div className="grid grid-cols-6 sm:grid-cols-5 gap-1.5">
                            {icons.map(({ id }) => {
                              const IconComponent = FLAT_ICONS[id] || Tag;
                              return (
                                <button
                                  key={id}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, icon: id })}
                                  className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
                                    formData.icon === id 
                                      ? 'bg-zinc-800 border border-zinc-700 shadow-md scale-110 z-0' 
                                      : 'hover:bg-zinc-800/50 hover:scale-105'
                                  }`}
                                  title={id}
                                >
                                  <IconComponent 
                                    className="w-5 h-5" 
                                    style={{ color: formData.icon === id ? formData.color : '#a1a1aa' }} 
                                  />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <Label className="text-zinc-300 font-bold">{formData.type === 'expense' ? 'Gasto Promedio (Opcional)' : 'Ingreso Promedio (Opcional)'}</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-zinc-500 font-bold">$</span>
                      </div>
                      <Input 
                        type="number"
                        step="0.01" min="0"
                        value={formData.plannedAmount}
                        onChange={e => setFormData({...formData, plannedAmount: e.target.value})}
                        placeholder="0.00"
                        className="pl-8 bg-zinc-900 border-zinc-800 rounded-xl h-11 font-medium placeholder:text-zinc-600 text-zinc-200"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      disabled={submitting}
                      className="w-full font-bold h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-zinc-950 transition-all"
                    >
                      {submitting ? 'Forjando...' : 'Crear Clasificación'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            {/* Columna Derecha - Listas de Categorías */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              {/* Gastos */}
              <div className="bento-card p-6 flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-rose-500/50"></div>
                
                <div className="flex items-center gap-2 border-b border-zinc-800/50 pb-4 mb-4">
                  <ArrowDownCircle className="w-5 h-5 text-rose-400" />
                  <h3 className="text-xl font-bold text-zinc-100">Gastos</h3>
                </div>
                
                <div className="flex-1">
                  {expenseCategories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-10 opacity-70">
                      <Layers className="w-10 h-10 text-zinc-600 mb-3" />
                      <p className="text-sm text-zinc-400">Sin categorías de salida.</p>
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {expenseCategories.map(cat => {
                        const IconComponent = FLAT_ICONS[cat.icon] || FLAT_ICONS['ShoppingBag'];
                        return (
                          <li key={cat.id} className="flex justify-between items-center p-3.5 rounded-2xl border border-zinc-800/50 bg-zinc-900/40 hover:bg-zinc-800/40 hover:border-zinc-700/50 transition-all group/item">
                            <div className="flex items-center gap-3.5">
                              <div className="p-2.5 rounded-xl bg-zinc-950 border shadow-sm group-hover/item:scale-105 transition-transform" style={{ borderColor: `${cat.color}40` }}>
                                <IconComponent className="w-4 h-4" style={{ color: cat.color }} />
                              </div>
                              <div>
                                <span className="font-bold text-zinc-100 block leading-none">{cat.name}</span>
                                {cat.plannedAmount > 0 && <span className="text-xs font-medium text-zinc-500 mt-1 block">Previsto: ${cat.plannedAmount}</span>}
                              </div>
                            </div>
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors opacity-0 group-hover/item:opacity-100 focus:opacity-100" onClick={() => handleDelete(cat.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>

              {/* Ingresos */}
              <div className="bento-card p-6 flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/50"></div>
                
                <div className="flex items-center gap-2 border-b border-zinc-800/50 pb-4 mb-4">
                  <ArrowUpCircle className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-xl font-bold text-zinc-100">Ingresos</h3>
                </div>
                
                <div className="flex-1">
                  {incomeCategories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-10 opacity-70">
                      <Layers className="w-10 h-10 text-zinc-600 mb-3" />
                      <p className="text-sm text-zinc-400">Sin categorías de entrada.</p>
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {incomeCategories.map(cat => {
                        const IconComponent = FLAT_ICONS[cat.icon] || Tag;
                        return (
                          <li key={cat.id} className="flex justify-between items-center p-3.5 rounded-2xl border border-zinc-800/50 bg-zinc-900/40 hover:bg-zinc-800/40 hover:border-zinc-700/50 transition-all group/item">
                            <div className="flex items-center gap-3.5">
                              <div className="p-2.5 rounded-xl bg-zinc-950 border shadow-sm group-hover/item:scale-105 transition-transform" style={{ borderColor: `${cat.color}40` }}>
                                <IconComponent className="w-4 h-4" style={{ color: cat.color }} />
                              </div>
                              <div>
                                <span className="font-bold text-zinc-100 block leading-none">{cat.name}</span>
                                {cat.plannedAmount > 0 && <span className="text-xs font-medium text-zinc-500 mt-1 block">Meta: ${cat.plannedAmount}</span>}
                              </div>
                            </div>
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors opacity-0 group-hover/item:opacity-100 focus:opacity-100" onClick={() => handleDelete(cat.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default CategoriesPage;