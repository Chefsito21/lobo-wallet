import pb from '@/lib/pocketbaseClient';
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, MessageSquare, LifeBuoy, Send, Zap } from 'lucide-react';
import Header from '@/components/Header.jsx';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext.jsx';

const SupportPage = () => {
  const { currentUser } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Mandamos los datos del estado a PocketBase
      await pb.collection('support_tickets').create({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        userId: currentUser?.id, 
      });
      
      toast.success('¡Transmisión recibida! Te contactaremos pronto.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error enviando el ticket:', error);
      toast.error('Interferencia en la red. Intenta enviar de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-emerald-500/30">
      <Helmet>
        <title>Soporte - LoboWallet</title>
      </Helmet>
      
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl relative z-10">
        
        {/* Resplandor ambiental */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none z-[-1]"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-10"
        >
          <h1 className="text-3xl md:text-5xl font-extrabold mb-2 tracking-tight text-zinc-100">
            Centro de <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Soporte</span>
          </h1>
          <p className="text-zinc-400 text-lg">¿Un bug en la Matrix? ¿Una idea brillante? Estamos aquí para escucharte.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Izquierda - Canales de Comunicación (Bento Grid) */}
          <div className="lg:col-span-1 space-y-6">
            
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bento-card p-6 flex flex-col items-center text-center group interactive-hover"
            >
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 mb-4 transition-transform group-hover:scale-110">
                <LifeBuoy className="w-7 h-7 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-zinc-100">Ayuda Técnica</h3>
              <p className="text-sm text-zinc-400 mt-2 font-medium">Resolvemos tus bugs y dudas operativas sobre la plataforma.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bento-card p-6 flex flex-col items-center text-center group interactive-hover"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mb-4 transition-transform group-hover:scale-110">
                <Mail className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-zinc-100">Línea Directa</h3>
              <p className="text-sm text-zinc-400 mt-2 font-medium">soporte@lobowallet.com</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bento-card p-6 flex flex-col items-center text-center group interactive-hover"
            >
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 mb-4 transition-transform group-hover:scale-110">
                <MessageSquare className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-zinc-100">Redes Sociales</h3>
              <p className="text-sm text-zinc-400 mt-2 font-medium">@LoboWalletApp</p>
            </motion.div>

          </div>

          {/* Columna Derecha - Formulario */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bento-card p-6 lg:p-8 h-full shadow-2xl">
              <div className="flex items-center gap-3 mb-8 border-b border-zinc-800/50 pb-4">
                <div className="p-2 rounded-xl bg-zinc-800/50 text-zinc-300">
                  <Zap className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-zinc-100">
                  Envíanos tu reporte
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-zinc-300 font-bold">Identificación</Label>
                    <Input 
                      id="name" 
                      placeholder="Tu nombre completo" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required 
                      className="bg-zinc-900 border-zinc-800 rounded-xl h-12 font-medium placeholder:text-zinc-600 text-zinc-200"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-zinc-300 font-bold">Correo de contacto</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="lobo@universidad.edu" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required 
                      className="bg-zinc-900 border-zinc-800 rounded-xl h-12 font-medium placeholder:text-zinc-600 text-zinc-200"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="subject" className="text-zinc-300 font-bold">Asunto</Label>
                  <Input 
                    id="subject" 
                    placeholder="Ej: Problema con categoría, Sugerencia de diseño..." 
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    required 
                    className="bg-zinc-900 border-zinc-800 rounded-xl h-12 font-medium placeholder:text-zinc-600 text-zinc-200"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="message" className="text-zinc-300 font-bold">Detalles</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Describe tu situación con el mayor detalle posible..." 
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required 
                    className="bg-zinc-900 border-zinc-800 rounded-xl font-medium placeholder:text-zinc-600 text-zinc-200 resize-none p-4"
                  />
                </div>

                <div className="pt-2">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="w-full font-bold h-12 rounded-xl transition-all bg-emerald-500 hover:bg-emerald-600 text-zinc-950 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                  >
                    {isSubmitting ? 'Transmitiendo datos...' : (
                      <span className="flex items-center justify-center">
                        <Send className="w-5 h-5 mr-2" />
                        Enviar Mensaje
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
};

export default SupportPage;