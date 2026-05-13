import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Pencil, Trash2, Plus, AlertTriangle } from 'lucide-react';
import Header from '@/components/Header.jsx';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';

const BudgetPage = () => {
  const { currentUser } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]); // 🚀 Ahora es dinámico
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
      // 🚀 Traemos presupuestos (expandiendo categoría), transacciones y categorías de Gasto
      const [budgetRecords, transactionRecords, categoryRecords] = await Promise.all([
        pb.collection('budgets').getFullList({
          filter: `userId = "${currentUser.id}"`,
          expand: 'category', // 🚀 Clave para ver el nombre y no el ID
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

      // Si hay categorías, seleccionamos la primera por defecto
      if (categoryRecords.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: categoryRecords[0].id }));
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentMonthSpending = (categoryId) => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    return transactions
      .filter(t => 
        t.type === 'expense' && 
        t.category === categoryId && // 🚀 Comparamos por ID
        t.date.startsWith(currentMonth)
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.monthlyLimit || parseFloat(formData.monthlyLimit) <= 0) {
      toast.error('Please enter a valid budget amount');
      return;
    }
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }

    setSubmitting(true);
    try {
      const data = {
        userId: currentUser.id,
        category: formData.category, // 🚀 Enviamos el ID real de la categoría
        monthlyLimit: parseFloat(formData.monthlyLimit),
      };

      if (editingId) {
        await pb.collection('budgets').update(editingId, data, { $autoCancel: false });
        toast.success('Budget updated');
      } else {
        const existing = budgets.find(b => b.category === formData.category);
        if (existing) {
          toast.error('Budget for this category already exists');
          setSubmitting(false);
          return;
        }
        await pb.collection('budgets').create(data, { $autoCancel: false });
        toast.success('Budget created');
      }

      setFormData({ category: categories.length > 0 ? categories[0].id : '', monthlyLimit: '' });
      setEditingId(null);
      fetchData();
    } catch (error) {
      console.error('Failed to save budget:', error);
      toast.error('Failed to save budget');
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
    if (!window.confirm('Delete this budget?')) return;

    try {
      await pb.collection('budgets').delete(id, { $autoCancel: false });
      toast.success('Budget deleted');
      fetchData();
    } catch (error) {
      console.error('Failed to delete budget:', error);
      toast.error('Failed to delete budget');
    }
  };

  if (loading) {
    return (
      <>
        <Helmet><title>Budgets - LoboWallet</title></Helmet>
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton className="h-96 lg:col-span-2" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Budgets - LoboWallet</title>
        <meta name="description" content="Manage your monthly budgets and track spending" />
      </Helmet>
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Budget Management</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Your Budgets</CardTitle>
              </CardHeader>
              <CardContent>
                {budgets.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">No budgets set yet</p>
                    <p className="text-sm text-muted-foreground">Create your first budget to start tracking spending</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {budgets.map((budget) => {
                      const spent = getCurrentMonthSpending(budget.category);
                      const percentage = (spent / budget.monthlyLimit) * 100;
                      const isWarning = percentage >= 80;
                      const isOver = percentage > 100;

                      // 🚀 Obtenemos el nombre expandido
                      const categoryName = budget.expand?.category?.name || 'Categoría Desconocida';

                      return (
                        <div key={budget.id} className="p-4 rounded-lg border">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-lg">{categoryName}</h3>
                              <p className="text-sm text-muted-foreground">
                                ${spent.toFixed(2)} of ${budget.monthlyLimit.toFixed(2)}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(budget)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(budget.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <Progress 
                            value={Math.min(percentage, 100)} 
                            className={`h-2 ${isOver ? '[&>div]:bg-destructive' : isWarning ? '[&>div]:bg-accent' : ''}`}
                          />
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-medium">
                              {percentage.toFixed(0)}% used
                            </span>
                            {isWarning && (
                              <div className="flex items-center gap-1 text-sm">
                                <AlertTriangle className={`w-4 h-4 ${isOver ? 'text-destructive' : 'text-accent'}`} />
                                <span className={isOver ? 'text-destructive font-medium' : 'text-accent font-medium'}>
                                  {isOver ? 'Over budget' : 'Approaching limit'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="shadow-lg sticky top-20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  {editingId ? 'Edit Budget' : 'Create Budget'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Categoría</Label>
                    <div className="flex gap-2 items-center">
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                        disabled={!!editingId}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Botón + cuadrado a la derecha */}
                      <Link to="/categories">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon" 
                          className="shrink-0" 
                          disabled={!!editingId}
                          title="Añadir categoría"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthlyLimit">Monthly Limit</Label>
                    <Input
                      id="monthlyLimit"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      value={formData.monthlyLimit}
                      onChange={(e) => setFormData({ ...formData, monthlyLimit: e.target.value })}
                      className="text-foreground"
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1" disabled={submitting}>
                      {submitting ? 'Saving...' : (editingId ? 'Update' : 'Create')}
                    </Button>
                    {editingId && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingId(null);
                          setFormData({ category: categories.length > 0 ? categories[0].id : '', monthlyLimit: '' });
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default BudgetPage;