import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Pencil, Trash2, Plus, ArrowDownCircle, ArrowUpCircle, Tag } from 'lucide-react';
import Header from '@/components/Header.jsx';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react'; // Añade Settings a tus iconos de lucide-react

// Importamos nuestra data de iconos para renderizarlos en la lista
import { FLAT_ICONS } from '@/lib/iconData.js';

const TransactionPage = () => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]); // Todas las categorías del usuario
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');

  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '', // Ahora guardará el ID
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, [currentUser.id]);

  // Filtro reactivo: Cuando cambia el tipo (income/expense), mostramos solo esas categorías
  const availableCategories = categories.filter(c => c.type === formData.type);

  // Auto-seleccionar la primera categoría disponible cuando cambias de Gasto a Ingreso y viceversa
  useEffect(() => {
    if (availableCategories.length > 0 && !editingId) {
      setFormData(prev => ({ ...prev, category: availableCategories[0].id }));
    } else if (availableCategories.length === 0 && !editingId) {
      setFormData(prev => ({ ...prev, category: '' }));
    }
  }, [formData.type, categories]);

  const fetchData = async () => {
    try {
      const [txRecords, catRecords] = await Promise.all([
        pb.collection('transactions').getFullList({
          filter: `userId = "${currentUser.id}"`,
          sort: '-date,-created',
          expand: 'category', // 🚀 Clave para obtener color, icono y nombre real
        }),
        pb.collection('categories').getFullList({
          filter: `userId = "${currentUser.id}"`,
          sort: 'name',
        })
      ]);
      setTransactions(txRecords);
      setCategories(catRecords);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.category || !formData.date) {
      return toast.error('Por favor, llena los campos obligatorios');
    }

    setSubmitting(true);
    try {
      const safeDate = new Date(formData.date).toISOString();
      const data = {
        userId: currentUser.id,
        type: formData.type,
        amount: parseFloat(formData.amount),
        category: formData.category, // Enviamos el ID de la categoría
        date: safeDate,
        notes: formData.notes,
      };

      if (editingId) {
        await pb.collection('transactions').update(editingId, data);
        toast.success('Transacción actualizada');
      } else {
        await pb.collection('transactions').create(data);
        toast.success('Transacción registrada');
      }

      setFormData({
        type: 'expense',
        amount: '',
        category: availableCategories.length > 0 ? availableCategories[0].id : '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
      setEditingId(null);
      fetchData();
    } catch (error) {
      toast.error('Error al guardar la transacción');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (transaction) => {
    const safeDate = transaction.date 
      ? transaction.date.substring(0, 10) 
      : new Date().toISOString().split('T')[0];

    setFormData({
      type: transaction.type || 'expense',
      amount: transaction.amount ? transaction.amount.toString() : '',
      category: transaction.category || '',
      date: safeDate,
      notes: transaction.notes || '',
    });
    setEditingId(transaction.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta transacción?')) return;
    try {
      await pb.collection('transactions').delete(id);
      toast.success('Transacción eliminada');
      fetchData();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const filteredTransactions = transactions.filter(t => 
    filterCategory === 'all' || t.category === filterCategory
  );

  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8"><Skeleton className="h-96 w-full" /></div>
      </>
    );
  }

  return (
    <>
      <Helmet><title>Transacciones - LoboWallet</title></Helmet>
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Transacciones</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Formulario (Izquierda/Arriba) */}
          <div>
            <Card className="shadow-lg sticky top-20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  {editingId ? 'Editar Transacción' : 'Nueva Transacción'}
                </CardTitle>
              </CardHeader>
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

                  <div className="space-y-2">
                    <Label>Categoría</Label>
                    
                    {availableCategories.length === 0 ? (
                      <div className="flex gap-2">
                        <div className="text-sm text-destructive p-2 border border-destructive/50 rounded bg-destructive/10 flex-1">
                          No tienes categorías de {formData.type === 'expense' ? 'gasto' : 'ingreso'}.
                        </div>
                        {/* Botón + cuando no hay categorías */}
                        <Link to="/categories">
                          <Button type="button" variant="outline" size="icon" className="shrink-0" title="Añadir categoría">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="flex gap-2 items-center">
                        <Select 
                          value={formData.category} 
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Selecciona..." />
                          </SelectTrigger>
                          <SelectContent>
                            {availableCategories.map(cat => {
                              const IconComponent = FLAT_ICONS[cat.icon] || Tag;
                              return (
                                <SelectItem key={cat.id} value={cat.id}>
                                  <div className="flex items-center gap-2">
                                    <IconComponent className="w-4 h-4" style={{ color: cat.color }}/>
                                    {cat.name}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>

                        {/* Botón + cuadrado a la derecha */}
                        <Link to="/categories">
                          <Button type="button" variant="outline" size="icon" className="shrink-0" title="Añadir categoría">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Monto</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01" min="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Fecha</Label>
                    <Input
                      id="date" type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas (Opcional)</Label>
                    <Textarea
                      id="notes" placeholder="Detalles de la transacción..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="resize-none" rows={2}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1" disabled={submitting || availableCategories.length === 0}>
                      {submitting ? 'Guardando...' : (editingId ? 'Actualizar' : 'Registrar')}
                    </Button>
                    {editingId && (
                      <Button type="button" variant="outline" onClick={() => {
                        setEditingId(null);
                        setFormData({ type: 'expense', amount: '', category: availableCategories[0]?.id || '', date: new Date().toISOString().split('T')[0], notes: '' });
                      }}>
                        Cancelar
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Transacciones (Derecha) */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Historial</CardTitle>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                {filteredTransactions.length === 0 ? (
                  <p className="text-center py-12 text-muted-foreground">No hay transacciones registradas.</p>
                ) : (
                  <div className="space-y-4">
                    {filteredTransactions.map((t) => {
                      // 🚀 Extraemos los datos expandidos de la categoría
                      const categoryData = t.expand?.category;
                      const catName = categoryData?.name || 'Desconocida';
                      const catColor = categoryData?.color || '#888888';
                      const IconComponent = FLAT_ICONS[categoryData?.icon] || Tag;
                      const isExpense = t.type === 'expense';

                      return (
                        <div key={t.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-background border" style={{ borderColor: catColor }}>
                              <IconComponent className="w-5 h-5" style={{ color: catColor }} />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{catName}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{new Date(t.date).toLocaleDateString()}</span>
                                {t.notes && (
                                  <>
                                    <span>•</span>
                                    <span className="truncate max-w-[150px] sm:max-w-[300px]">{t.notes}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`font-bold text-lg ${isExpense ? 'text-foreground' : 'text-emerald-500'}`}>
                              {isExpense ? '-' : '+'}${t.amount.toFixed(2)}
                            </span>
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" onClick={() => handleEdit(t)}>
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(t.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </>
  );
};

export default TransactionPage;