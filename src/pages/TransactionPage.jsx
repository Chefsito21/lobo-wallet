import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Pencil, Trash2, Plus, ArrowDownCircle, ArrowUpCircle, Tag, Receipt, Wallet } from 'lucide-react';
import Header from '@/components/Header.jsx';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FLAT_ICONS } from '@/lib/iconData.js';

const TransactionPage = () => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [editingId, setEditingId] = useState(null);
  const [editingOriginal, setEditingOriginal] = useState(null); // NUEVO: Guarda el estado original para matemáticas inversas
  
  const [filterCategory, setFilterCategory] = useState('all');

  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    account: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, [currentUser.id]);

  const availableCategories = categories.filter(c => c.type === formData.type);

  useEffect(() => {
    if (availableCategories.length > 0 && !editingId) {
      setFormData(prev => ({ ...prev, category: availableCategories[0].id }));
    } else if (availableCategories.length === 0 && !editingId) {
      setFormData(prev => ({ ...prev, category: '' }));
    }
  }, [formData.type, categories]);

  const fetchData = async () => {
    try {
      const [txRecords, catRecords, accRecords] = await Promise.all([
        pb.collection('transactions').getFullList({
          filter: `userId = "${currentUser.id}"`,
          sort: '-date,-created',
          expand: 'category,account',
        }),
        pb.collection('categories').getFullList({
          filter: `userId = "${currentUser.id}"`,
          sort: 'name',
        }),
        pb.collection('accounts').getFullList({
          filter: `userId = "${currentUser.id}"`,
          sort: '-created',
        })
      ]);
      
      setTransactions(txRecords);
      setCategories(catRecords);
      setAccounts(accRecords);

      if (!editingId && accRecords.length > 0 && !formData.account) {
        const defaultAcc = accRecords.find(a => a.isDefault) || accRecords[0];
        setFormData(prev => ({ ...prev, account: defaultAcc.id }));
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar para actualizar el balance de una cuenta en PocketBase
  const updateAccountBalance = async (accountId, amountChange) => {
    try {
      const account = await pb.collection('accounts').getOne(accountId);
      const newBalance = account.balance + amountChange;
      await pb.collection('accounts').update(accountId, { balance: newBalance });
    } catch (error) {
      console.error(`Error actualizando saldo de la cuenta ${accountId}:`, error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.category || !formData.date || !formData.account) {
      return toast.error('Por favor, llena los campos obligatorios');
    }

    setSubmitting(true);
    try {
      const safeDate = new Date(formData.date).toISOString();
      const parsedAmount = parseFloat(formData.amount);
      const isExpense = formData.type === 'expense';
      
      const data = {
        userId: currentUser.id,
        type: formData.type,
        amount: parsedAmount,
        category: formData.category,
        account: formData.account,
        date: safeDate,
        notes: formData.notes,
      };

      if (editingId) {
        // 1. REVERTIR el efecto de la transacción original en su cuenta original
        const oldIsExpense = editingOriginal.type === 'expense';
        const revertAmount = oldIsExpense ? editingOriginal.amount : -editingOriginal.amount;
        if (editingOriginal.account) {
          await updateAccountBalance(editingOriginal.account, revertAmount);
        }

        // 2. APLICAR el nuevo efecto en la cuenta seleccionada (puede ser la misma o una nueva)
        const applyAmount = isExpense ? -parsedAmount : parsedAmount;
        await updateAccountBalance(formData.account, applyAmount);

        // 3. Guardar cambios
        await pb.collection('transactions').update(editingId, data);
        toast.success('Transacción actualizada y saldos sincronizados');
      } else {
        // CREACIÓN: Simplemente afectar la cuenta seleccionada
        const applyAmount = isExpense ? -parsedAmount : parsedAmount;
        await updateAccountBalance(formData.account, applyAmount);

        await pb.collection('transactions').create(data);
        toast.success('Transacción registrada y saldo actualizado');
      }

      // Reiniciar formulario
      const defaultAcc = accounts.find(a => a.isDefault) || accounts[0];
      setFormData({
        type: 'expense',
        amount: '',
        category: availableCategories.length > 0 ? availableCategories[0].id : '',
        account: defaultAcc ? defaultAcc.id : '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
      setEditingId(null);
      setEditingOriginal(null);
      fetchData(); // Refrescar todo
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar la transacción');
      if (error.response && error.response.data) {
        console.error("🔍 DETALLES DE POCKETBASE:", error.response.data);
      }
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
      account: transaction.account || '',
      date: safeDate,
      notes: transaction.notes || '',
    });
    setEditingId(transaction.id);
    setEditingOriginal(transaction); // Guardamos la foto original de la transacción
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // NUEVO: Ahora pasamos el objeto completo para saber cuánto dinero revertir
  const handleDelete = async (transaction) => {
    if (!window.confirm('¿Eliminar esta transacción y restaurar el saldo de la cuenta?')) return;
    try {
      // 1. Revertir saldo
      const isExpense = transaction.type === 'expense';
      const revertAmount = isExpense ? transaction.amount : -transaction.amount;
      if (transaction.account) {
        await updateAccountBalance(transaction.account, revertAmount);
      }

      // 2. Eliminar registro
      await pb.collection('transactions').delete(transaction.id);
      toast.success('Transacción eliminada y saldo restaurado');
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
      <div className="min-h-screen bg-zinc-950 text-zinc-50">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
          <Skeleton className="h-10 w-64 mb-8 bg-zinc-800/50 rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton className="h-[500px] bg-zinc-800/50 rounded-3xl" />
            <Skeleton className="h-[500px] lg:col-span-2 bg-zinc-800/50 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-emerald-500/30">
      <Helmet><title>Transacciones - LoboWallet</title></Helmet>
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="mb-10">
            <h1 className="text-3xl md:text-5xl font-extrabold mb-2 tracking-tight text-zinc-100">
              Gestión de <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Transacciones</span>
            </h1>
            <p className="text-zinc-400 text-lg">Registra y administra el flujo de tu dinero.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Formulario (Izquierda/Arriba) */}
            <div className="lg:col-span-1">
              <div className="bento-card p-6 lg:p-8 lg:sticky lg:top-24 shadow-2xl">
                <div className="flex items-center gap-3 mb-8 border-b border-zinc-800/50 pb-4">
                  <div className="p-2 rounded-xl bg-zinc-800/50 text-zinc-300">
                    <Plus className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-zinc-100">
                    {editingId ? 'Editar Movimiento' : 'Nuevo Movimiento'}
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Selector de Tipo (Income/Expense) */}
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

                  {/* Selector de Cuentas */}
                  <div className="space-y-3">
                    <Label className="text-zinc-300 font-bold">Cuenta de origen/destino</Label>
                    <Select 
                      value={formData.account} 
                      onValueChange={(value) => setFormData({ ...formData, account: value })}
                    >
                      <SelectTrigger className="bg-zinc-900 border-zinc-800 rounded-xl h-12">
                        <SelectValue placeholder="Selecciona una cuenta..." />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 rounded-xl">
                        {accounts.map(acc => (
                          <SelectItem key={acc.id} value={acc.id} className="hover:bg-zinc-800 focus:bg-zinc-800 rounded-lg cursor-pointer my-1">
                            <div className="flex items-center gap-2">
                              <Wallet className="w-4 h-4 text-zinc-400" />
                              <span className="font-medium text-zinc-200">
                                {acc.name} {acc.isDefault && <span className="text-xs text-zinc-500">(Principal)</span>}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Selector de Categoría */}
                  <div className="space-y-3">
                    <Label className="text-zinc-300 font-bold">Categoría</Label>
                    
                    {availableCategories.length === 0 ? (
                      <div className="flex gap-2">
                        <div className="text-sm text-rose-400 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex-1 flex items-center font-medium">
                          No hay categorías de {formData.type === 'expense' ? 'gasto' : 'ingreso'}.
                        </div>
                        <Link to="/categories">
                          <Button type="button" variant="outline" className="w-12 h-full rounded-xl border-zinc-700 hover:bg-zinc-800 shrink-0" title="Añadir categoría">
                            <Plus className="w-5 h-5 text-zinc-300" />
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="flex gap-2 items-center">
                        <Select 
                          value={formData.category} 
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                          <SelectTrigger className="flex-1 bg-zinc-900 border-zinc-800 rounded-xl h-12">
                            <SelectValue placeholder="Selecciona..." />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-800 rounded-xl">
                            {availableCategories.map(cat => {
                              const IconComponent = FLAT_ICONS[cat.icon] || Tag;
                              return (
                                <SelectItem key={cat.id} value={cat.id} className="hover:bg-zinc-800 focus:bg-zinc-800 rounded-lg cursor-pointer my-1">
                                  <div className="flex items-center gap-3">
                                    <IconComponent className="w-4 h-4" style={{ color: cat.color }}/>
                                    <span className="font-medium text-zinc-200">{cat.name}</span>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>

                        <Link to="/categories">
                          <Button type="button" variant="outline" className="w-12 h-12 rounded-xl border-zinc-700 hover:bg-zinc-800 shrink-0" title="Añadir categoría">
                            <Plus className="w-5 h-5 text-zinc-300" />
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="amount" className="text-zinc-300 font-bold">Monto</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-zinc-500 font-bold">$</span>
                      </div>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01" min="0.01"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                        className="pl-8 bg-zinc-900 border-zinc-800 rounded-xl h-12 text-lg font-semibold placeholder:text-zinc-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="date" className="text-zinc-300 font-bold">Fecha</Label>
                    <Input
                      id="date" type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                      className="bg-zinc-900 border-zinc-800 rounded-xl h-12 text-zinc-200 font-medium [color-scheme:dark]"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="notes" className="text-zinc-300 font-bold">Notas <span className="text-zinc-500 font-normal">(Opcional)</span></Label>
                    <Textarea
                      id="notes" placeholder="Detalles de la transacción..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="resize-none bg-zinc-900 border-zinc-800 rounded-xl text-zinc-200" rows={3}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button 
                      type="submit" 
                      className={`flex-1 font-bold h-12 rounded-xl transition-all ${editingId ? 'bg-cyan-500 hover:bg-cyan-600 text-zinc-950' : 'bg-emerald-500 hover:bg-emerald-600 text-zinc-950'}`} 
                      disabled={submitting || availableCategories.length === 0}
                    >
                      {submitting ? 'Guardando...' : (editingId ? 'Actualizar' : 'Registrar')}
                    </Button>
                    
                    {editingId && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="h-12 px-6 rounded-xl border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-bold"
                        onClick={() => {
                          const defaultAcc = accounts.find(a => a.isDefault) || accounts[0];
                          setEditingId(null);
                          setEditingOriginal(null);
                          setFormData({ type: 'expense', amount: '', category: availableCategories[0]?.id || '', account: defaultAcc?.id || '', date: new Date().toISOString().split('T')[0], notes: '' });
                        }}
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* Lista de Transacciones (Derecha) */}
            <div className="lg:col-span-2">
              <div className="bento-card p-6 lg:p-8 flex flex-col max-h-[calc(100vh-8rem)]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800/50 pb-6 mb-6 shrink-0">
                  <h2 className="text-2xl font-bold text-zinc-100">Historial</h2>
                  
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full sm:w-[220px] bg-zinc-900 border-zinc-800 rounded-xl h-11">
                      <SelectValue placeholder="Filtrar por categoría" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 rounded-xl">
                      <SelectItem value="all" className="hover:bg-zinc-800 cursor-pointer font-bold text-zinc-300">Todas las categorías</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id} className="hover:bg-zinc-800 cursor-pointer">
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Contenedor con Scroll Interno */}
                <div 
                  className="flex-1 overflow-y-auto pr-2 pb-4"
                  style={{ scrollbarWidth: 'thin', scrollbarColor: '#3f3f46 transparent' }}
                >
                  {filteredTransactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-20 h-20 rounded-full bg-zinc-800/50 flex items-center justify-center mb-6">
                        <Receipt className="w-10 h-10 text-zinc-500" />
                      </div>
                      <p className="text-zinc-400 text-lg font-medium">No hay transacciones registradas.</p>
                      <p className="text-zinc-600 mt-2 max-w-sm">Añade tu primer movimiento usando el formulario para ver tu historial aquí.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredTransactions.map((t) => {
                        const categoryData = t.expand?.category;
                        const catName = categoryData?.name || 'Desconocida';
                        const catColor = categoryData?.color || '#a1a1aa';
                        const IconComponent = FLAT_ICONS[categoryData?.icon] || Tag;
                        
                        const accountData = t.expand?.account;
                        const accName = accountData?.name || 'Cuenta no asignada';

                        const isExpense = t.type === 'expense';

                        return (
                          <div key={t.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 hover:bg-zinc-800/40 hover:border-zinc-700/50 transition-all group gap-4 sm:gap-0">
                            
                            <div className="flex items-center gap-4">
                              <div className="p-3 rounded-xl bg-zinc-950 border shadow-sm group-hover:scale-105 transition-transform shrink-0" style={{ borderColor: `${catColor}40` }}>
                                <IconComponent className="w-5 h-5" style={{ color: catColor }} />
                              </div>
                              <div>
                                <p className="font-bold text-zinc-100 text-base">{catName}</p>
                                <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500 font-medium mt-0.5">
                                  <span>{new Date(t.date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                  <span className="hidden sm:inline text-zinc-700">•</span>
                                  <span className="text-xs bg-zinc-800/80 px-2 py-0.5 rounded-md text-zinc-400 flex items-center gap-1">
                                    <Wallet className="w-3 h-3" /> {accName}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t border-zinc-800/50 sm:border-0 pt-4 sm:pt-0">
                              <span className={`font-extrabold text-xl tracking-tight ${isExpense ? 'text-zinc-100' : 'text-emerald-400'}`}>
                                {isExpense ? '-' : '+'}${t.amount.toFixed(2)}
                              </span>
                              <div className="flex gap-2 shrink-0">
                                <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl hover:bg-cyan-500/10 hover:text-cyan-400 text-zinc-400 transition-colors" onClick={() => handleEdit(t)}>
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl hover:bg-rose-500/10 hover:text-rose-400 text-zinc-400 transition-colors" onClick={() => handleDelete(t)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                          </div>
                        );
                      })}
                    </div>
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

export default TransactionPage;