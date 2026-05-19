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
  ArrowRightLeft, Edit, X, History, ArrowRight, PiggyBank, TrendingUp
} from 'lucide-react';

const INVESTMENT_PRESETS = {
  nu_turbo: { name: "Cajita Turbo Nu", rate: 13 },
  nu_garantia: { name: "Cajita Garantía Nu", rate: 6.75 },
  uala: { name: "Ualá", rate: 15.00 },
  mercadopago: { name: "Mercado Pago (GBM)", rate: 15.00 },
  klar: { name: "Klar Plus", rate: 14.00 },
  custom: { name: "Otra / Personalizada", rate: "" }
};

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
  // Añadimos yieldRate al estado inicial
  const [accountForm, setAccountForm] = useState({ name: '', type: 'debit', balance: '', yieldRate: '' });
  const [transferForm, setTransferForm] = useState({ from: '', to: '', amount: '' });

  // ==========================================
  // MOTOR DE RENDIMIENTOS (INTERÉS COMPUESTO)
  // ==========================================
  const calculateYield = (account) => {
    // Si no es cuenta de inversión o no tiene tasa, regresamos el saldo normal
    if (account.type !== 'investment' || !account.yieldRate) {
      return { total: account.balance, generated: 0 };
    }

    // Fecha de última actualización de la cuenta en PocketBase
    const lastUpdate = new Date(account.updated);
    const today = new Date();
    
    // Calculamos la diferencia en días
    const daysDiff = Math.floor((today - lastUpdate) / (1000 * 60 * 60 * 24));

    // Si no ha pasado ni un día, no hay rendimiento nuevo
    if (daysDiff <= 0) return { total: account.balance, generated: 0 };

    // Fórmula de Interés Compuesto Diario
    const dailyRate = (account.yieldRate / 100) / 365;
    const newTotal = account.balance * Math.pow((1 + dailyRate), daysDiff);
    
    const generated = newTotal - account.balance;

    return { 
      total: newTotal, 
      generated: generated 
    };
  };

  // Nuevo ícono para cuentas de inversión/rendimiento
  const getAccountIcon = (type) => {
    switch (type) {
      case 'debit': return <Landmark className="w-6 h-6 text-cyan-400" />;
      case 'credit': return <CreditCard className="w-6 h-6 text-purple-400" />;
      case 'cash': return <Banknote className="w-6 h-6 text-emerald-400" />;
      case 'investment': return <PiggyBank className="w-6 h-6 text-amber-400" />;
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
      setAccountForm({ 
        name: account.name, 
        type: account.type, 
        balance: account.balance.toString(),
        yieldRate: account.yieldRate ? account.yieldRate.toString() : ''
      });
    } else {
      setEditingAccount(null);
      setAccountForm({ name: '', type: 'debit', balance: '', yieldRate: '' });
    }
    setIsAccountModalOpen(true);
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    if (!accountForm.name || accountForm.balance === '') return toast.error('Llena los campos obligatorios');
    
    setSubmitting(true);
    try {
      const parsedBalance = parseFloat(accountForm.balance);
      const parsedYield = parseFloat(accountForm.yieldRate);

      const data = {
        userId: currentUser.id,
        name: accountForm.name,
        type: accountForm.type,
        balance: isNaN(parsedBalance) ? 0 : parsedBalance,
        // Forzamos a que sea un número, si está vacío o no es inversión, manda 0
        yieldRate: (accountForm.type === 'investment' && !isNaN(parsedYield)) ? parsedYield : 0,
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
      await pb.collection('accounts').update(sourceAcc.id, { balance: sourceAcc.balance - amount });
      await pb.collection('accounts').update(destAcc.id, { balance: destAcc.balance + amount });

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
      fetchData(); 
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
              <p className="text-zinc-400 text-lg">Administra tus tarjetas, efectivo y rendimientos.</p>
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
              <motion.div key={account.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }} className={`p-6 rounded-3xl bg-zinc-900/40 border transition-all group flex flex-col justify-between min-h-[160px] ${account.type === 'investment' ? 'border-amber-500/30 hover:border-amber-500/50' : 'border-zinc-800/50 hover:border-zinc-700/50'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 shadow-sm">
                      {getAccountIcon(account.type)}
                    </div>
                    <div>
                      <span className="font-bold text-zinc-100 text-lg flex items-center gap-2">
                        {account.name} 
                        {account.isDefault && <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full uppercase tracking-widest">Principal</span>}
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
                {/* Saldo y Rendimiento */}
                <div>
                  {/* Calculamos los datos mágicos en tiempo real */}
                  {(() => {
                    const { total, generated } = calculateYield(account);
                    
                    return (
                      <>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm text-zinc-500 font-medium uppercase tracking-wider flex items-center gap-2">
                            Disponible
                            {account.type === 'investment' && account.yieldRate > 0 && (
                              <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                                +{account.yieldRate}% APY
                              </span>
                            )}
                          </p>
                        </div>
                        
                        <h3 className="text-3xl font-bold text-zinc-100 tracking-tight">
                          ${total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h3>
                        
                        {/* Se muestra SOLO si es inversión y ya generó algo de dinero */}
                        {account.type === 'investment' && generated >= 0 && (
                          <div className="mt-2 inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-xs font-medium text-emerald-400">
                              +${generated.toFixed(4)} generado
                            </span>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </motion.div>
            ))}
          </div>

          {/* HISTORIAL DE TRANSFERENCIAS */}
          <div className="bento-card p-6 lg:p-8 flex flex-col max-h-[400px]">
            <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-6 mb-6 shrink-0">
              <div className="p-2 rounded-xl bg-zinc-800/50 text-zinc-300"><History className="w-5 h-5" /></div>
              <h2 className="text-2xl font-bold text-zinc-100">Historial de Transferencias</h2>
            </div>

            <div 
              className="flex-1 overflow-y-auto pr-2"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#3f3f46 transparent' }}
            >
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
                        <div className="p-3 rounded-xl bg-zinc-950 border border-cyan-500/20 shrink-0"><ArrowRightLeft className="w-5 h-5 text-cyan-400" /></div>
                        <div>
                          <div className="flex items-center gap-2 font-bold text-zinc-200">
                            {t.expand?.fromAccount?.name || 'Cuenta borrada'} 
                            <ArrowRight className="w-3 h-3 text-zinc-500 shrink-0" /> 
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
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden">
              <button onClick={() => setIsAccountModalOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white z-10"><X className="w-5 h-5"/></button>
              
              {/* Efecto de luz dinámico según el tipo seleccionado */}
              <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors ${accountForm.type === 'investment' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
              
              <h2 className="text-2xl font-bold text-zinc-100 mb-6 relative z-10">{editingAccount ? 'Editar Cuenta' : 'Nueva Cuenta'}</h2>
              
              <form onSubmit={handleSaveAccount} className="space-y-4 relative z-10">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Nombre de la cuenta</Label>
                  <Input value={accountForm.name} onChange={e => setAccountForm({...accountForm, name: e.target.value})} placeholder="Ej. Cajita Nu" required className="bg-zinc-900 border-zinc-800 rounded-xl h-12" />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-zinc-300">Tipo de Cuenta</Label>
                  <Select value={accountForm.type} onValueChange={v => setAccountForm({...accountForm, type: v})}>
                    <SelectTrigger className="bg-zinc-900 border-zinc-800 rounded-xl h-12"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      <SelectItem value="debit">Cuenta de Débito / Banco</SelectItem>
                      <SelectItem value="credit">Tarjeta de Crédito</SelectItem>
                      <SelectItem value="cash">Dinero en Efectivo</SelectItem>
                      <SelectItem value="investment" className="text-amber-400 font-medium">Cajita / Inversión</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* CAMPO DINÁMICO: Solo se muestra si es cuenta de inversión */}
                <AnimatePresence>
                  // 2. Dentro de tu formulario, abajo del tipo de cuenta, inyectas esto:
                  {accountForm.type === 'investment' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
                      
                      {/* Selector de Institución */}
                      <div className="space-y-2">
                        <Label className="text-zinc-300">Institución Financiera</Label>
                        <Select onValueChange={(value) => {
                          if (value !== 'custom') {
                            setAccountForm({ ...accountForm, yieldRate: INVESTMENT_PRESETS[value].rate.toString() });
                          }
                        }}>
                          <SelectTrigger className="bg-zinc-900 border-zinc-800 rounded-xl h-12"><SelectValue placeholder="Selecciona una opción..." /></SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-800">
                            <SelectItem value="nu_garantia">Nu Crédito en Garantía (6.75%)</SelectItem>
                            <SelectItem value="nu_turbo">Nu Turbo (13.00%)</SelectItem>
                            <SelectItem value="uala">Ualá ABC (15.00%)</SelectItem>
                            <SelectItem value="mercadopago">Mercado Pago (15.00%)</SelectItem>
                            <SelectItem value="klar">Klar (14.00%)</SelectItem>
                            <SelectItem value="custom">Otra cuenta con rendimiento (Manual)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Campo de Tasa (Se auto-rellena o se escribe manualmente) */}
                      <div className="space-y-2">
                        <Label className="text-amber-400/80">Tasa de Rendimiento Anual (APY %)</Label>
                        <Input 
                          type="number" 
                          step="0.01" 
                          value={accountForm.yieldRate} 
                          onChange={e => setAccountForm({...accountForm, yieldRate: e.target.value})} 
                          placeholder="Ej. 14.75" 
                          className="bg-zinc-900 border-amber-500/30 focus-visible:ring-amber-500/50 rounded-xl h-12 text-amber-400 font-bold" 
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  <Label className="text-zinc-300">Saldo Actual</Label>
                  <Input type="number" step="0.01" value={accountForm.balance} onChange={e => setAccountForm({...accountForm, balance: e.target.value})} placeholder="0.00" required className="bg-zinc-900 border-zinc-800 rounded-xl h-12 font-bold" />
                </div>

                <Button type="submit" disabled={submitting} className={`w-full font-bold rounded-xl h-12 mt-4 text-zinc-950 transition-colors ${accountForm.type === 'investment' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}>
                  {submitting ? 'Guardando...' : 'Guardar Cuenta'}
                </Button>
              </form>
            </motion.div>
          </div>
        )}

        {/* MODAL DE TRANSFERENCIA (Sin Cambios) */}
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