import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { Trash2, Plus, ArrowUpCircle, ArrowDownCircle, Tag } from 'lucide-react';
import Header from '@/components/Header.jsx';
import { toast } from 'sonner';

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
      color: prev.type === 'expense' ? '#ef4444' : '#22c55e'
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
      toast.success('Categoría creada exitosamente');

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
    if (!window.confirm('¿Eliminar esta categoría? Nota: Las transacciones asociadas podrían perder su etiqueta.')) return;
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
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet><title>Categorías - LoboWallet</title></Helmet>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Gestión de Categorías</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <Card className="shadow-lg h-fit lg:sticky lg:top-20">
            <CardHeader><CardTitle className="flex items-center gap-2"><Plus className="w-5 h-5"/> Nueva Categoría</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'expense' })}
                    className={`py-2 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      formData.type === 'expense' ? 'bg-background shadow text-red-500' : 'text-muted-foreground hover:bg-background/50'
                    }`}
                  >
                    <ArrowDownCircle className="w-4 h-4" /> Gasto
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'income' })}
                    className={`py-2 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      formData.type === 'income' ? 'bg-background shadow text-emerald-500' : 'text-muted-foreground hover:bg-background/50'
                    }`}
                  >
                    <ArrowUpCircle className="w-4 h-4" /> Ingreso
                  </button>
                </div>
                
                <div>
                  <Label>Nombre</Label>
                  <Input 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Ej: Netflix, Salario..."
                  />
                </div>
                
                <div>
                  <Label>Color de la Categoría</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${formData.color === color ? 'border-foreground scale-125' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Icono</Label>
                  <div className="h-48 overflow-y-auto border rounded-md p-2 mt-2 space-y-4 bg-card/50">
                    {Object.entries(ICON_CATEGORIES).map(([categoryName, icons]) => (
                      <div key={categoryName}>
                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 sticky top-0 bg-background/90 py-1 z-10">
                          {categoryName}
                        </h4>
                        <div className="grid grid-cols-6 gap-1">
                          {/* Corrección: ahora buscamos el componente directo en FLAT_ICONS */}
                          {icons.map(({ id }) => {
                            const IconComponent = FLAT_ICONS[id] || Tag;
                            return (
                              <button
                                key={id}
                                type="button"
                                onClick={() => setFormData({ ...formData, icon: id })}
                                className={`p-2 rounded-md transition-all flex items-center justify-center ${
                                  formData.icon === id ? 'bg-primary/20 border border-primary scale-110' : 'hover:bg-accent'
                                }`}
                                title={id}
                              >
                                <IconComponent 
                                  className="w-5 h-5" 
                                  style={{ color: formData.icon === id ? formData.color : 'currentColor' }} 
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>{formData.type === 'expense' ? 'Gasto Programado' : 'Ingreso Previsto'} (Mensual)</Label>
                  <Input 
                    type="number"
                    value={formData.plannedAmount}
                    onChange={e => setFormData({...formData, plannedAmount: e.target.value})}
                    placeholder="0.00 (Opcional)"
                  />
                </div>
                <Button className="w-full" disabled={submitting}>Crear Categoría</Button>
              </form>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <Card className="shadow-lg border-t-4 border-t-red-500/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-500">
                  <ArrowDownCircle className="w-5 h-5" /> Gastos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {expenseCategories.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No hay categorías de gastos.</p>
                ) : (
                  <ul className="space-y-2">
                    {expenseCategories.map(cat => {
                      // Corrección: Era 'cat.icon', no 'category.icon'
                      const IconComponent = FLAT_ICONS[cat.icon] || FLAT_ICONS['ShoppingBag'];
                      return (
                        <li key={cat.id} className="flex justify-between items-center p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-background border" style={{ borderColor: cat.color }}>
                              <IconComponent className="w-4 h-4" style={{ color: cat.color }} />
                            </div>
                            <div>
                              <span className="font-medium block leading-none">{cat.name}</span>
                              {cat.plannedAmount > 0 && <span className="text-[10px] text-muted-foreground mt-1">Previsto: ${cat.plannedAmount}</span>}
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(cat.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg border-t-4 border-t-emerald-500/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-500">
                  <ArrowUpCircle className="w-5 h-5" /> Ingresos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {incomeCategories.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No hay categorías de ingresos.</p>
                ) : (
                  <ul className="space-y-2">
                    {incomeCategories.map(cat => {
                      const IconComponent = FLAT_ICONS[cat.icon] || Tag;
                      return (
                        <li key={cat.id} className="flex justify-between items-center p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-background border" style={{ borderColor: cat.color }}>
                              <IconComponent className="w-4 h-4" style={{ color: cat.color }} />
                            </div>
                            <div>
                              <span className="font-medium block leading-none">{cat.name}</span>
                              {cat.plannedAmount > 0 && <span className="text-[10px] text-muted-foreground mt-1">Meta: ${cat.plannedAmount}</span>}
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(cat.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </>
  );
};

export default CategoriesPage;