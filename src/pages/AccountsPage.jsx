import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Plus, CreditCard, Wallet, Banknote, Trash2, Landmark, 
  ArrowRightLeft, Edit, X, History, ArrowRight 
} from 'lucide-react';

const AccountsPage = () => {
  const { currentUser } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para Modales
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Estados de Formularios
  const [editingAccount, setEditingAccount] = useState(null);
  const [accountForm, setAccountForm] = useState({ name: '', type: 'debit', balance: '' });
  const [transferForm, setTransferForm] = useState({ from: '', to: '', amount: '' });

  const getAccountIcon = (type) => {
    switch (type) {
      case 'debit': return <Landmark className="w-6 h-6 text-cyan-400" />;
      case 'credit': return <CreditCard className="w-6 h-6 text-purple-400" />;
      case 'cash': return <Banknote className="w-6 h-6 text-emerald-400" />;
      default: return <Wallet className="w-6 h-6 text-zinc-400" />;
    }
  };

  const fetchData = async () => {
    try {
      const [accRecords, transRecords] = await Promise.all([
        pb.collection('accounts').getFullList({
          filter: `userId = "${currentUser.id}"`,
          sort: '-created',
        }),
        pb.collection('transfers').getFullList({
          filter: `userId = "${currentUser.id}"`,
          sort: '-date,-created',
          expand: 'fromAccount,toAccount'
        })
      ]);
      setAccounts(accRecords);
      setTransfers(transRecords);
    } catch (error) {
      console.error('Error al obtener datos:', error);
      if (error.response && error.response.data) {
        console.error("🔍 DETALLES DE POCKETBASE:", error.response.data);
    }
      toast.error('Error al sincronizar cuentas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser.id]);

  // ==========================================
  // LÓGICA DE CUENTAS (CRUD)
  // ==========================================
  const handleOpenAccountModal = (account = null) => {
    if (account) {
      setEditingAccount(account);
      setAccountForm({ name: account.name, type: account.type, balance: account.balance.toString() });
    } else {
      setEditingAccount(null);
      setAccountForm({ name: '', type: 'debit', balance: '' });
    }
    setIsAccountModalOpen(true);
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    if (!accountForm.name || accountForm.balance === '') return toast.error('Llena los campos obligatorios');
    
    setSubmitting(true);
    try {
      const data = {
        userId: currentUser.id,
        name: accountForm.name,
        type: accountForm.type,
        balance: parseFloat(accountForm.balance),
      };

      if (editingAccount) {
        await pb.collection('accounts').update(editingAccount.id, data);
        toast.success('Cuenta actualizada');
      } else {
        await pb.collection('accounts').create(data);
        toast.success('Nueva cuenta registrada');
      }
      setIsAccountModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Error al guardar la cuenta');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta cuenta? Esto no eliminará sus transacciones, pero podría afectar tus estadísticas.')) return;
    try {
      await pb.collection('accounts').delete(id);
      toast.success('Cuenta eliminada');
      fetchData();
    } catch (error) {
      toast.error('Error al eliminar la cuenta');
    }
  };

  // ==========================================
  // LÓGICA DE TRANSFERENCIAS
  // ==========================================
  const handleExecuteTransfer = async (e) => {
    e.preventDefault();
    if (!transferForm.from || !transferForm.to || !transferForm.amount) {
      return toast.error('Completa todos los datos de la transferencia');
    }
    if (transferForm.from === transferForm.to) {
      return toast.error('No puedes transferir a la misma cuenta');
    }

    const amount = parseFloat(transferForm.amount);
    if (amount <= 0) return toast.error('El monto debe ser mayor a cero');

    const sourceAcc = accounts.find(a => a.id === transferForm.from);
    const destAcc = accounts.find(a => a.id === transferForm.to);

    setSubmitting(true);
    try {
      // 1. Actualizar saldos matemáticamente
      await pb.collection('accounts').update(sourceAcc.id, { balance: sourceAcc.balance - amount });
      await pb.collection('accounts').update(destAcc.id, { balance: destAcc.balance + amount });

      // 2. Registrar el movimiento en el historial de transferencias
      await pb.collection('transfers').create({
        userId: currentUser.id,
        fromAccount: sourceAcc.id,
        toAccount: destAcc.id,
        amount: amount,
        date: new Date().toISOString()
      });

      toast.success('Transferencia completada con éxito');
      setIsTransferModalOpen(false);
      setTransferForm({ from: '', to: '', amount: '' });
      fetchData(); // Refrescar UI
    } catch (error) {
      console.error(error);
      toast.error('Error al procesar la transferencia');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50"><Header />
      <div className="container mx-auto px-4 py-8 max-w-5xl"><Skeleton className="h-10 w-64 mb-8 bg-zinc-800/50 rounded-lg" /></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-emerald-500/30 pb-20">
      <Helmet><title>Mis Cuentas - LoboWallet</title></Helmet>
      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          
          {/* HEADER DE LA PÁGINA */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight text-zinc-100">Mis Cuentas</h1>
              <p className="text-zinc-400 text-lg">Administra tus tarjetas, efectivo y transferencias.</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setIsTransferModalOpen(true)} variant="outline" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 font-bold rounded-xl px-4 py-6">
                <ArrowRightLeft className="w-5 h-5 mr-2" />
                Transferir
              </Button>
              <Button onClick={() => handleOpenAccountModal()} className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold rounded-xl px-4 py-6 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <Plus className="w-5 h-5 mr-2" />
                Nueva Cuenta
              </Button>
            </div>
          </div>

          {/* GRID DE CUENTAS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Tarjeta Global */}
            <motion.div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-900/40 via-zinc-900/40 to-cyan-900/40 border border-emerald-500/30 flex flex-col justify-between min-h-[160px] relative overflow-hidden">
              <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-zinc-950 border border-emerald-500/50 shadow-sm"><Landmark className="w-6 h-6 text-emerald-400" /></div>
                  <span className="font-bold text-zinc-100 text-lg">Global</span>
                </div>
                <div>
                  <p className="text-sm text-emerald-400/80 font-medium uppercase tracking-wider mb-1">Balance Total</p>
                  <h3 className="text-3xl font-bold text-white tracking-tight">${accounts.reduce((sum, acc) => sum + acc.balance, 0).toFixed(2)}</h3>
                </div>
              </div>
            </motion.div>

            {/* Tarjetas Reales */}
            {accounts.map((account, index) => (
              <motion.div key={account.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }} className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/50 hover:bg-zinc-800/40 hover:border-zinc-700/50 transition-all group flex flex-col justify-between min-h-[160px]">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 shadow-sm">{getAccountIcon(account.type)}</div>
                    <div>
                      <span className="font-bold text-zinc-100 text-lg flex items-center gap-2">
                        {account.name} {account.isDefault && <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full uppercase tracking-widest">Principal</span>}
                      </span>
                    </div>
                  </div>
                  
                  {/* Acciones de Cuenta */}
                  <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenAccountModal(account)} className="text-zinc-500 hover:text-cyan-400 p-2 transition-colors"><Edit className="w-4 h-4" /></button>
                    {!account.isDefault && (
                      <button onClick={() => handleDeleteAccount(account.id)} className="text-zinc-500 hover:text-rose-400 p-2 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-zinc-500 font-medium uppercase tracking-wider mb-1">Disponible</p>
                  <h3 className="text-3xl font-bold text-zinc-100 tracking-tight">${account.balance.toFixed(2)}</h3>
                </div>
              </motion.div>
            ))}
          </div>

          {/* HISTORIAL DE TRANSFERENCIAS */}
          <div className="bento-card p-6 lg:p-8">
            <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-6 mb-6">
              <div className="p-2 rounded-xl bg-zinc-800/50 text-zinc-300"><History className="w-5 h-5" /></div>
              <h2 className="text-2xl font-bold text-zinc-100">Historial de Transferencias</h2>
            </div>

            {transfers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <ArrowRightLeft className="w-12 h-12 text-zinc-700 mb-4" />
                <p className="text-zinc-400 font-medium">Aún no has realizado movimientos entre tus cuentas.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transfers.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 hover:bg-zinc-800/40 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-zinc-950 border border-cyan-500/20"><ArrowRightLeft className="w-5 h-5 text-cyan-400" /></div>
                      <div>
                        <div className="flex items-center gap-2 font-bold text-zinc-200">
                          {t.expand?.fromAccount?.name || 'Cuenta borrada'} 
                          <ArrowRight className="w-3 h-3 text-zinc-500" /> 
                          {t.expand?.toAccount?.name || 'Cuenta borrada'}
                        </div>
                        <p className="text-sm text-zinc-500 font-medium">{new Date(t.date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}</p>
                      </div>
                    </div>
                    <div className="font-extrabold text-lg text-zinc-100">${t.amount.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {/* ==========================================
          MODALES FLOTANTES (OVERLAYS)
          ========================================== */}
      <AnimatePresence>
        
        {/* MODAL DE CUENTA */}
        {isAccountModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
              <button onClick={() => setIsAccountModalOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X className="w-5 h-5"/></button>
              <h2 className="text-2xl font-bold text-zinc-100 mb-6">{editingAccount ? 'Editar Cuenta' : 'Nueva Cuenta'}</h2>
              
              <form onSubmit={handleSaveAccount} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Nombre de la cuenta</Label>
                  <Input value={accountForm.name} onChange={e => setAccountForm({...accountForm, name: e.target.value})} placeholder="Ej. BBVA Débito" required className="bg-zinc-900 border-zinc-800 rounded-xl h-12" />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-zinc-300">Tipo</Label>
                  <Select value={accountForm.type} onValueChange={v => setAccountForm({...accountForm, type: v})}>
                    <SelectTrigger className="bg-zinc-900 border-zinc-800 rounded-xl h-12"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      <SelectItem value="debit">Cuenta de Débito / Banco</SelectItem>
                      <SelectItem value="credit">Tarjeta de Crédito</SelectItem>
                      <SelectItem value="cash">Dinero en Efectivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-300">Saldo Actual</Label>
                  <Input type="number" step="0.01" value={accountForm.balance} onChange={e => setAccountForm({...accountForm, balance: e.target.value})} placeholder="0.00" required className="bg-zinc-900 border-zinc-800 rounded-xl h-12 font-bold" />
                  <p className="text-xs text-zinc-500">Puedes poner saldos negativos si es una tarjeta de crédito.</p>
                </div>

                <Button type="submit" disabled={submitting} className="w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold rounded-xl h-12 mt-4">
                  {submitting ? 'Guardando...' : 'Guardar Cuenta'}
                </Button>
              </form>
            </motion.div>
          </div>
        )}

        {/* MODAL DE TRANSFERENCIA */}
        {isTransferModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-zinc-950 border border-cyan-500/30 rounded-3xl p-6 w-full max-w-md shadow-[0_0_40px_rgba(6,182,212,0.15)] relative">
              <button onClick={() => setIsTransferModalOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X className="w-5 h-5"/></button>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400"><ArrowRightLeft className="w-6 h-6" /></div>
                <h2 className="text-2xl font-bold text-zinc-100">Transferir Dinero</h2>
              </div>
              
              <form onSubmit={handleExecuteTransfer} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300 font-medium text-sm">Cuenta de Origen (De donde sale)</Label>
                  <Select value={transferForm.from} onValueChange={v => setTransferForm({...transferForm, from: v})}>
                    <SelectTrigger className="bg-zinc-900 border-zinc-800 rounded-xl h-12 font-medium"><SelectValue placeholder="Selecciona..."/></SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      {accounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name} (${acc.balance.toFixed(2)})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-center -my-2 relative z-10">
                   <div className="bg-zinc-800 p-1.5 rounded-full border border-zinc-700 shadow-lg">
                      <ArrowRight className="w-4 h-4 text-zinc-400 rotate-90" />
                   </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-zinc-300 font-medium text-sm">Cuenta de Destino (A donde entra)</Label>
                  <Select value={transferForm.to} onValueChange={v => setTransferForm({...transferForm, to: v})}>
                    <SelectTrigger className="bg-zinc-900 border-zinc-800 rounded-xl h-12 font-medium"><SelectValue placeholder="Selecciona..."/></SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      {accounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 pt-2">
                  <Label className="text-zinc-300">Cantidad a transferir</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
                    <Input type="number" step="0.01" min="0.01" value={transferForm.amount} onChange={e => setTransferForm({...transferForm, amount: e.target.value})} placeholder="0.00" required className="pl-8 bg-zinc-900 border-zinc-800 rounded-xl h-14 text-xl font-bold text-cyan-400 focus-visible:ring-cyan-500/50" />
                  </div>
                </div>

                <Button type="submit" disabled={submitting} className="w-full bg-cyan-500 hover:bg-cyan-600 text-zinc-950 font-bold rounded-xl h-14 mt-6 text-lg shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                  {submitting ? 'Procesando...' : 'Confirmar Transferencia'}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AccountsPage;