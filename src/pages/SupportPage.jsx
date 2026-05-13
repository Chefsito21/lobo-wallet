import pb from '@/lib/pocketbaseClient';
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, MessageSquare, LifeBuoy, Send } from 'lucide-react';
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
      
      toast.success('¡Mensaje enviado! Te contactaremos pronto.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error enviando el ticket:', error);
      toast.error('Hubo un problema al enviar tu mensaje. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Soporte - LoboWallet</title>
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        
        <main className="flex-1 container max-w-5xl py-8 mt-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold tracking-tight mb-2">Centro de Soporte</h1>
            <p className="text-zinc-400">¿Tienes algún problema o sugerencia? Estamos aquí para ayudarte.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Columna de Información de Contacto */}
            <div className="md:col-span-1 space-y-6">
              <div className="bento-card p-6 flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <LifeBuoy size={24} />
                </div>
                <div>
                  <h3 className="font-medium">Ayuda Técnica</h3>
                  <p className="text-sm text-zinc-400 mt-1">Resolvemos tus bugs y dudas sobre la plataforma.</p>
                </div>
              </div>

              <div className="bento-card p-6 flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-medium">Correo Electrónico</h3>
                  <p className="text-sm text-zinc-400 mt-1">soporte@lobowallet.com</p>
                </div>
              </div>

              <div className="bento-card p-6 flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h3 className="font-medium">Redes Sociales</h3>
                  <p className="text-sm text-zinc-400 mt-1">@LoboWalletApp</p>
                </div>
              </div>
            </div>

            {/* Columna del Formulario */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="md:col-span-2 bento-card p-6 md:p-8"
            >
              <h2 className="text-xl font-semibold mb-6">Envíanos un mensaje</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input 
                      id="name" 
                      placeholder="Tu nombre completo" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required 
                      className="bg-zinc-900/50 border-zinc-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="tu@correo.com" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required 
                      className="bg-zinc-900/50 border-zinc-800"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Asunto</Label>
                  <Input 
                    id="subject" 
                    placeholder="¿En qué podemos ayudarte?" 
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    required 
                    className="bg-zinc-900/50 border-zinc-800"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Describe tu problema o sugerencia con detalle..." 
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required 
                    className="bg-zinc-900/50 border-zinc-800 resize-none"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white transition-all"
                >
                  {isSubmitting ? 'Enviando...' : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Mensaje
                    </>
                  )}
                </Button>
              </form>
            </motion.div>

          </div>
        </main>
      </div>
    </>
  );
};

export default SupportPage;