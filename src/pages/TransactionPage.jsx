import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Pencil, Trash2, Plus, Filter, CalendarPlus as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Header from '@/components/Header.jsx';
import { toast } from 'sonner';

const TransactionPage = () => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [submitting, setSubmitting] = useState(false);

  const categories = ['Food', 'Transportation', 'Entertainment', 'Education', 'Utilities', 'Shopping', 'Other'];

  useEffect(() => {
    fetchTransactions();
  }, [currentUser.id]);

  const fetchTransactions = async () => {
    try {
      const records = await pb.collection('transactions').getFullList({
        filter: `userId = "${currentUser.id}"`,
        sort: '-date,-created',
        $autoCancel: false,
      });
      setTransactions(records);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'expense',
      amount: '',
      category: 'Food',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!formData.date) {
      toast.error('Please select a date');
      return;
    }

    setSubmitting(true);
    try {
      const data = {
        userId: currentUser.id,
        type: formData.type,
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date,
        notes: formData.notes,
      };

      if (editingId) {
        await pb.collection('transactions').update(editingId, data, { $autoCancel: false });
        toast.success('Transaction updated');
      } else {
        await pb.collection('transactions').create(data, { $autoCancel: false });
        toast.success('Transaction added');
      }

      setIsModalOpen(false);
      resetForm();
      fetchTransactions();
    } catch (error) {
      console.error('Failed to save transaction:', error);
      toast.error('Failed to save transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (transaction) => {
    // 1. Formateamos la fecha de PocketBase de "2026-05-12 10:30:00.000Z" a "YYYY-MM-DD"
    // Usamos substring(0,10) para capturar solo los primeros 10 caracteres de manera segura.
    const safeDate = transaction.date 
      ? transaction.date.substring(0, 10) 
      : new Date().toISOString().split('T')[0];

    setFormData({
      type: transaction.type || 'expense',
      // 2. Escudo contra null/undefined antes de convertir a string
      amount: transaction.amount ? transaction.amount.toString() : '',
      category: transaction.category || 'Food',
      date: safeDate,
      notes: transaction.notes || '',
    });
    
    setEditingId(transaction.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;

    try {
      await pb.collection('transactions').delete(id, { $autoCancel: false });
      toast.success('Transaction deleted');
      fetchTransactions();
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      toast.error('Failed to delete transaction');
    }
  };

  const filteredTransactions = filterCategory === 'all'
    ? transactions
    : transactions.filter(t => t.category === filterCategory);

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Transactions - LoboWallet</title>
        </Helmet>
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Transactions - LoboWallet</title>
        <meta name="description" content="Manage your income and expenses" />
      </Helmet>
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Transactions</h1>
          <Button onClick={openAddModal} size="lg" className="rounded-full shadow-md interactive-hover">
            <Plus className="w-5 h-5 mr-2" />
            Add Transaction
          </Button>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 gap-4">
            <CardTitle className="text-xl">History</CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">No transactions found</p>
                <Button variant="link" onClick={openAddModal} className="mt-4">
                  Record a new transaction
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border bg-card hover:shadow-md transition-all duration-300 gap-4 group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          transaction.type === 'income'
                            ? 'bg-[#10B981]/15 text-[#10B981]'
                            : 'bg-[#EF4444]/15 text-[#EF4444]'
                        }`}>
                          {transaction.type}
                        </span>
                        <span className="font-semibold text-lg">{transaction.category}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })} 
                        {transaction.notes && <span className="ml-2 px-2 py-0.5 bg-muted rounded-md">{transaction.notes}</span>}
                      </p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      <span className={`text-2xl font-bold ${
                        transaction.type === 'income' ? 'text-[#10B981]' : 'text-[#EF4444]'
                      }`} style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </span>
                      <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(transaction)}
                          className="hover:bg-primary/10 hover:text-primary hover:scale-110 active:scale-95 transition-all"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(transaction.id)}
                          className="hover:bg-destructive/10 hover:text-destructive hover:scale-110 active:scale-95 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal Dialog for Add/Edit Transaction */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl">{editingId ? 'Edit Transaction' : 'New Transaction'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <div className="space-y-2">
                <Label>Transaction Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="h-12 text-lg font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full h-12 justify-start text-left font-normal",
                          !formData.date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date ? format(new Date(formData.date + 'T12:00:00'), "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.date ? new Date(formData.date + 'T12:00:00') : new Date()}
                        onSelect={(date) => {
                          if (date) {
                            setFormData({ ...formData, date: date.toISOString().split('T')[0] });
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input
                  id="notes"
                  type="text"
                  placeholder="Add a brief note"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="h-12"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 h-12"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 h-12 text-base font-bold" 
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : (editingId ? 'Update' : 'Save')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default TransactionPage;